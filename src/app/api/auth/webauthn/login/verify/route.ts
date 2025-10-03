import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import sql from 'mssql';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { fromBase64URL, toBase64URL } from '@/lib/base64url';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';

const RP_ID = process.env.RP_ID;
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.ORIGIN ? process.env.ORIGIN.split(',') : [])
  .map((o) => o.trim())
  .filter(Boolean);
if (!allowedOrigins.length && process.env.ORIGIN) {
  allowedOrigins.push(
    isProd ? `https://localhost:3000` : `http://localhost:3000`
  );
}

// 已抽離共用 base64url util

const DEBUG = process.env.WEBAUTHN_DEBUG === '1';

function dlog(...args: any[]) {
  if (DEBUG) console.log('[WebAuthn][login.verify]', ...args);
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

    const cookie = request.headers.get('cookie') || '';
    const userMatch = cookie.match(/pendingUserId=([^;]+)/);
    const chalMatch = cookie.match(/webauthnLoginChallenge=([^;]+)/);
    if (!chalMatch) {
      return NextResponse.json(
        {
          success: false,
          error: '挑戰不存在或逾期',
          code: 'CHALLENGE_MISSING',
        },
        { status: 400 }
      );
    }
    const expectedChallenge = chalMatch[1];
    const issued = cookie.match(/webauthnLoginIssuedAt=([^;]+)/);
    if (issued) {
      const t = Number(issued[1]);
      if (Number.isFinite(t) && Date.now() - t > 3 * 60 * 1000) {
        return NextResponse.json(
          { success: false, error: '挑戰已過期', code: 'CHALLENGE_EXPIRED' },
          { status: 400 }
        );
      }
    }
    const expectedUserId = userMatch ? Number(userMatch[1]) : null;

    const body = (await request.json()) as AuthenticationResponseJSON & {
      rawId?: string;
    };
    dlog('Incoming assertion credential id(raw):', body?.id);

    if (body.type !== 'public-key') {
      return NextResponse.json(
        { success: false, error: '類型錯誤', code: 'TYPE_INVALID' },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    let normalizedId = body.id;
    try {
      normalizedId = toBase64URL(fromBase64URL(body.id));
    } catch {}

    // 可能的候選 id（避免前端 / 不同瀏覽器對 id / rawId 編碼差異造成找不到）
    const candidates = new Set<string>();
    if (body.id) candidates.add(body.id);
    if (normalizedId) candidates.add(normalizedId);
    if (body.rawId) {
      try {
        const rawNorm = toBase64URL(fromBase64URL(body.rawId));
        candidates.add(body.rawId);
        candidates.add(rawNorm);
      } catch {}
    }
    const candidateArr = Array.from(candidates);
    dlog('Credential ID candidates:', candidateArr);

    // 逐一嘗試查找
    let cred: any = null;
    for (const cid of candidateArr) {
      const r = await pool
        .request()
        .input('cid', sql.NVarChar, cid)
        .query(
          `SELECT TOP 1 * FROM [ProjectTracking].[dbo].[WebAuthnCredentials] WHERE credentialId = @cid AND isActive = 1`
        );
      if (r.recordset.length) {
        cred = r.recordset[0];
        normalizedId = cid; // 使用匹配到的 id
        dlog('Matched credential with candidate id', cid);
        break;
      }
    }

    if (!cred) {
      dlog('Credential not found with any candidate');
      return NextResponse.json(
        { success: false, error: '憑證不存在', code: 'CREDENTIAL_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (expectedUserId && cred.userId !== expectedUserId) {
      return NextResponse.json(
        { success: false, error: '使用者不匹配', code: 'USER_MISMATCH' },
        { status: 403 }
      );
    }
    const userId = cred.userId;

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge,
        expectedRPID: RP_ID,
        expectedOrigin: allowedOrigins,
        authenticator: {
          credentialID: fromBase64URL(cred.credentialId),
          credentialPublicKey: Buffer.from(cred.publicKey),
          counter: cred.signCount || 0,
          transports: undefined,
        } as any,
        requireUserVerification: true,
      });
    } catch (verr: any) {
      const name = verr?.name || '';
      if (name === 'NotAllowedError') {
        return NextResponse.json(
          { success: false, error: '操作被拒絕', code: 'NOT_ALLOWED' },
          { status: 400 }
        );
      }
      if (name === 'InvalidStateError') {
        return NextResponse.json(
          { success: false, error: '狀態無效', code: 'INVALID_STATE' },
          { status: 400 }
        );
      }
      if (name === 'SecurityError') {
        return NextResponse.json(
          { success: false, error: '安全條件不符', code: 'SECURITY' },
          { status: 400 }
        );
      }
      const msg = (verr?.message || '').toLowerCase();
      if (msg.includes('rp id')) {
        return NextResponse.json(
          { success: false, error: 'RP ID 不符', code: 'RP_ID_MISMATCH' },
          { status: 400 }
        );
      }
      if (msg.includes('origin')) {
        return NextResponse.json(
          { success: false, error: '來源不被允許', code: 'ORIGIN_NOT_ALLOWED' },
          { status: 400 }
        );
      }
      console.error('verifyAuthenticationResponse error', verr);
      return NextResponse.json(
        { success: false, error: '驗證失敗', code: 'VERIFY_EXCEPTION' },
        { status: 400 }
      );
    }

    const { verified, authenticationInfo } = verification;
    if (!verified || !authenticationInfo) {
      dlog('Verification failed', { verified, authenticationInfo });
      return NextResponse.json(
        { success: false, error: '驗證失敗', code: 'VERIFY_FAILED' },
        { status: 400 }
      );
    }

    const newCounter = authenticationInfo.newCounter ?? 0;
    const oldCounter = cred.signCount || 0;
    dlog('Counter check', { oldCounter, newCounter });
    if (newCounter !== 0 && oldCounter !== 0 && newCounter <= oldCounter) {
      return NextResponse.json(
        {
          success: false,
          error: '偵測到重放 (counter)',
          code: 'REPLAY_DETECTED',
        },
        { status: 400 }
      );
    }
    const storeCounter = newCounter > oldCounter ? newCounter : oldCounter;

    await pool
      .request()
      .input('cid', sql.NVarChar, normalizedId)
      .input('sc', sql.Int, storeCounter)
      .query(
        `UPDATE [ProjectTracking].[dbo].[WebAuthnCredentials] SET lastUsedAt = GETDATE(), signCount = @sc WHERE credentialId = @cid`
      );

    const res = NextResponse.json({ success: true });
    // 登入驗證成功，設置正式 session cookie；dev 不強制 secure
    res.cookies.set('teamMemberId', String(userId), {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    if (expectedUserId) res.cookies.delete('pendingUserId');
    res.cookies.delete('pendingStep');
    res.cookies.delete('webauthnLoginChallenge');
    return res;
  } catch (e) {
    console.error('login verify error', e);
    return NextResponse.json(
      { success: false, error: '登入驗證失敗', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
