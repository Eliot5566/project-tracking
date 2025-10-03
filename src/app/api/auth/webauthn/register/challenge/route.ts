import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { generateRegistrationOptions } from '@simplewebauthn/server';

const RP_NAME = 'ProjectTracking';
const RP_ID = process.env.RP_ID; // 必須設定
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.ORIGIN ? process.env.ORIGIN.split(',') : [])
  .map((o) => o.trim())
  .filter(Boolean);

export async function POST(request: Request) {
  try {
    if (!RP_ID || !allowedOrigins.length) {
      return NextResponse.json(
        { success: false, error: '伺服器未設定 RP_ID/ORIGIN' },
        { status: 500 }
      );
    }

    const cookie = request.headers.get('cookie') || '';
    const pending = cookie.match(/pendingUserId=([^;]+)/);
    const session = cookie.match(/teamMemberId=([^;]+)/);
    if (!pending && !session) {
      return NextResponse.json(
        { success: false, error: '需登入後才能啟用生物辨識' },
        { status: 400 }
      );
    }
    const userId = Number(pending ? pending[1] : session![1]);

    const pool = await getConnection();
    const userResult = await pool
      .request()
      .input('uid', sql.Int, userId)
      .query(
        `SELECT TOP 1 employeeId, name FROM [ProjectTracking].[dbo].[TeamMembers] WHERE id=@uid`
      );
    if (userResult.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: '使用者不存在' },
        { status: 404 }
      );
    }

    const userRow = userResult.recordset[0];
    const userIDBytes = new TextEncoder().encode(String(userId));
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: userIDBytes,
      userName: userRow.employeeId,
      userDisplayName: userRow.name,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'required', // 改為可被瀏覽器發現的 discoverable passkey
        requireResidentKey: true,
        userVerification: 'required',
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    const res = NextResponse.json({ success: true, publicKey: options });
    res.cookies.set('webauthnRegChallenge', options.challenge, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 300,
    });
    res.cookies.set('webauthnRegIssuedAt', String(Date.now()), {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 300,
    });
    return res;
  } catch (e) {
    console.error('register challenge error', e);
    return NextResponse.json(
      { success: false, error: '產生註冊挑戰失敗' },
      { status: 500 }
    );
  }
}
