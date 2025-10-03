import { NextResponse } from 'next/server';

// 登出：清除所有登入 / WebAuthn 相關 cookie
export async function POST() {
  const isProd = process.env.NODE_ENV === 'production';
  const res = NextResponse.json({ success: true });
  // 清除 cookie；dev 不強制 secure 以確保可清除 http cookie
  const clear = (name: string) =>
    res.cookies.set(name, '', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: 0,
    });
  [
    'teamMemberId',
    'pendingUserId',
    'pendingStep',
    'webauthnRegChallenge',
    'webauthnLoginChallenge',
  ].forEach(clear);
  return res;
}

export async function GET() {
  return POST();
}
