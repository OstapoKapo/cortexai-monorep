import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  const hasToken = request.cookies.get('accessToken');

  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (hasToken && isAuthPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

    if (!hasToken && !isAuthPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};