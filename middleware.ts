import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('teamMemberId')?.value;
  const { pathname } = request.nextUrl;
  const publicPaths = [
    '/login',
    '/api/auth/login',
    '/api/auth/webauthn',
    '/api/auth/webauthn/register',
    '/api/auth/webauthn/login',
    '/api/auth/me',
  ];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  if (!session && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
