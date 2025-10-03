import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';
import { toBase64URL } from '@/lib/base64url';
const DEBUG = process.env.WEBAUTHN_DEBUG === '1';
function dlog(...args: any[]) {
  if (DEBUG) console.log('[WebAuthn][register.verify]', ...args);
}

const RP_ID = process.env.RP_ID;
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.ORIGIN ? process.env.ORIGIN.split(',') : [])
  .map((o) => o.trim())
  .filter(Boolean);

export async function POST(request: Request) {
  try {
    if (!process.env.RP_ID || !allowedOrigins.length) {
      return NextResponse.json(
        {
          success: false,
          error: '伺服器未設定 RP_ID/ORIGIN',
          code: 'SERVER_MISCONFIG',
        },
        { status: 500 }
      );
    }
    const cookie = request.headers.get('cookie') || '';
    const pending = cookie.match(/pendingUserId=([^;]+)/);
    const session = cookie.match(/teamMemberId=([^;]+)/);
    const challengeCookie = cookie.match(/webauthnRegChallenge=([^;]+)/);
    const issuedMatch = cookie.match(/webauthnRegIssuedAt=([^;]+)/);
    if (issuedMatch) {
      const issuedAt = Number(issuedMatch[1]);
      if (Number.isFinite(issuedAt) && Date.now() - issuedAt > 5 * 60 * 1000) {
        return NextResponse.json(
          { success: false, error: '挑戰已過期', code: 'CHALLENGE_EXPIRED' },
          { status: 400 }
        );
      }
    }

    if (!challengeCookie) {
      return NextResponse.json(
        {
          success: false,
          error: '挑戰不存在或逾期',
          code: 'CHALLENGE_MISSING',
        },
        { status: 400 }
      );
    }
    if (!pending && !session) {
      return NextResponse.json(
        { success: false, error: '使用者不存在或未登入', code: 'USER_MISSING' },
        { status: 400 }
      );
    }
    const userId = Number(pending ? pending[1] : session![1]);
    if (!Number.isFinite(userId)) {
      return NextResponse.json(
        { success: false, error: '使用者識別無效', code: 'USER_ID_INVALID' },
        { status: 400 }
      );
    }
    const expectedChallenge = challengeCookie[1];

    const body = (await request.json()) as RegistrationResponseJSON;
    dlog('Start verify', {
      userId,
      expectedChallenge: expectedChallenge?.slice(0, 8) + '...',
    });

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: allowedOrigins,
        expectedRPID: process.env.RP_ID,
        requireUserVerification: true,
      });
    } catch (err: any) {
      console.error('verifyRegistrationResponse error', err);
      const msg = (err?.message || '').toLowerCase();
      let code = 'VERIFY_EXCEPTION';
      if (
        msg.includes('challenge mismatch') ||
        msg.includes('challenge was not the expected value')
      )
        code = 'CHALLENGE_MISMATCH';
      else if (msg.includes('rp id')) code = 'RP_ID_MISMATCH';
      else if (msg.includes('origin')) code = 'ORIGIN_NOT_ALLOWED';
      return NextResponse.json(
        { success: false, error: '註冊驗證失敗', code },
        { status: 400 }
      );
    }

    const { verified, registrationInfo } = verification;
    if (!verified || !registrationInfo) {
      return NextResponse.json(
        { success: false, error: '驗證未通過', code: 'VERIFY_FAILED' },
        { status: 400 }
      );
    }

    const { credentialPublicKey, credentialID, counter } = registrationInfo;
    const credIdB64 = toBase64URL(credentialID as any);
    dlog('New credential', { userId, credIdB64url: credIdB64, counter });

    const pool = await getConnection();
    const credCheck = await pool
      .request()
      .input('cid', sql.NVarChar, credIdB64)
      .query(
        `SELECT TOP 1 id FROM [ProjectTracking].[dbo].[WebAuthnCredentials] WHERE credentialId = @cid`
      );
    if (credCheck.recordset.length) {
      return NextResponse.json(
        { success: false, error: '憑證已存在', code: 'CREDENTIAL_EXISTS' },
        { status: 409 }
      );
    }

    await pool
      .request()
      .input('userId', sql.Int, userId)
      .input('credentialId', sql.NVarChar, credIdB64)
      .input(
        'publicKey',
        sql.VarBinary,
        Buffer.from(credentialPublicKey as any)
      )
      .input('signCount', sql.Int, counter)
      .query(`INSERT INTO [ProjectTracking].[dbo].[WebAuthnCredentials](userId, credentialId, publicKey, signCount, createdAt, isActive)
              VALUES (@userId, @credentialId, @publicKey, @signCount, GETDATE(), 1)`);

    const res = NextResponse.json({ success: true });
    // 註冊成功後設定正式 session cookie；dev 環境不強制 secure 以利本機測試
    res.cookies.set('teamMemberId', String(userId), {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    if (pending) res.cookies.delete('pendingUserId');
    res.cookies.delete('pendingStep');
    res.cookies.delete('webauthnRegChallenge');
    return res;
  } catch (e) {
    console.error('register verify error', e);
    return NextResponse.json(
      { success: false, error: '註冊驗證失敗', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
