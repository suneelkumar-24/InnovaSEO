import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_NAME = 'nh_session_token';

// Routes requiring authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/research',
  '/saved',
  '/autopilot',
  '/compare',
  '/history',
  '/admin',
  '/settings',
  '/checklist',
  '/detector',
  '/blueprints',
  '/anomalies',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_NAME)?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // If visiting protected route without token, redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visiting login page without explicit switch, redirect to dashboard
  if (pathname === '/login' && token && !request.nextUrl.searchParams.has('switch')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
