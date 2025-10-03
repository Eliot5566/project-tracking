import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { generateAuthenticationOptions } from '@simplewebauthn/server';

const RP_ID = process.env.RP_ID;
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.ORIGIN ? process.env.ORIGIN.split(',') : [])
  .map((o) => o.trim())
  .filter(Boolean);

const DEBUG = process.env.WEBAUTHN_DEBUG === '1';
function dlog(...args: any[]) {
  if (DEBUG) console.log('[WebAuthn][login.challenge]', ...args);
}

export async function POST(request: Request) {
  try {
    if (!RP_ID || !allowedOrigins.length) {
      return NextResponse.json(
        {
          success: false,
          error: '伺服器未設定 RP_ID/ORIGIN',
          code: 'SERVER_MISCONFIG',
        },
        { status: 500 }
      );
    }

    let employeeId: string | undefined;
    try {
      const body = await request.json().catch(() => null);
      employeeId = body?.employeeId?.trim();
    } catch {}

    const pool = await getConnection();

    if (!employeeId) {
      // usernameless / discoverable 模式
      const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        timeout: 60000,
        userVerification: 'required',
      });
      const res = NextResponse.json({ success: true, publicKey: options });
      res.cookies.set('webauthnLoginChallenge', options.challenge, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
        maxAge: 180,
      });
      res.cookies.set('webauthnLoginIssuedAt', String(Date.now()), {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
        maxAge: 180,
      });
      return res;
    }

    // 原本工號 + allowCredentials 流程
    const tm = await pool
      .request()
      .input('employeeId', sql.NVarChar, employeeId)
      .query(
        `SELECT TOP 1 tm.id FROM [ProjectTracking].[dbo].[TeamMembers] tm WHERE tm.employeeId = @employeeId`
      );
    if (!tm.recordset.length) {
      return NextResponse.json(
        {
          success: false,
          error: '使用者不存在或尚未綁定',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }
    const userId = tm.recordset[0].id;

    const creds = await pool
      .request()
      .input('uid', sql.Int, userId)
      .query(
        `SELECT credentialId FROM [ProjectTracking].[dbo].[WebAuthnCredentials] WHERE userId = @uid AND isActive = 1`
      );
    if (!creds.recordset.length) {
      return NextResponse.json(
        { success: false, error: '尚未啟用生物辨識', code: 'NO_PASSKEY' },
        { status: 404 }
      );
    }
    const allow = creds.recordset.map((r: any) => ({
      id: r.credentialId as string,
      type: 'public-key',
    }));
    dlog('User credentials', { userId, count: allow.length });

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      timeout: 60000,
      allowCredentials: allow,
      userVerification: 'required',
    });
    dlog('Generated challenge', {
      userId,
      allowCount: allow.length,
      challenge: options.challenge,
    });

    const res = NextResponse.json({
      success: true,
      publicKey: options,
      userId,
    });
    res.cookies.set('webauthnLoginChallenge', options.challenge, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 180,
    });
    res.cookies.set('webauthnLoginIssuedAt', String(Date.now()), {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 180,
    });
    res.cookies.set('pendingUserId', String(userId), {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 180,
    });
    return res;
  } catch (e) {
    console.error('login challenge error', e);
    return NextResponse.json(
      { success: false, error: '產生登入挑戰失敗', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
