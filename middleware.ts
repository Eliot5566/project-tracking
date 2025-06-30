import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  // 只保護 /projects 頁面（可依需求擴充 pattern）
  if (!token && request.nextUrl.pathname.startsWith('/projects')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

// 指定哪些路徑要套用 middleware
export const config = {
  matcher: ['/projects/:path*'],
};
