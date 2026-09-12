import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_NAME = 'nh_session_token';

// Helper to validate JWT structure and expiration without external dependencies
function isTokenValid(token: string | undefined): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);

    if (!payload || !payload.userId) return false;

    // Check expiration if exp claim is present
    if (payload.exp && typeof payload.exp === 'number') {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTimestamp) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static asset paths bypass
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Retrieve token from Cookie or Authorization header
  let token = request.cookies.get(TOKEN_NAME)?.value;
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  const validToken = isTokenValid(token);

  // 2. Auth API routes: Allow /api/auth through unconditionally
  if (pathname === '/api/auth' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // 3. Any other API route (/api/*) requires authentication
  if (pathname.startsWith('/api/')) {
    if (!validToken) {
      const response = NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: You must log in to access this software.',
        },
        { status: 401 }
      );
      response.headers.set('Cache-Control', 'no-store, max-age=0');
      response.cookies.delete(TOKEN_NAME);
      response.cookies.set(TOKEN_NAME, '', { path: '/', maxAge: 0 });
      return response;
    }
    return NextResponse.next();
  }

  // 4. Handle Login Page
  if (pathname === '/login') {
    // If user already has a valid token and did not explicitly request account switch, send to dashboard
    if (validToken && !request.nextUrl.searchParams.has('switch')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 5. If user is NOT authenticated on any page (including / or any protected route):
  if (!validToken) {
    const loginUrl = new URL('/login', request.url);
    // Only add redirect parameter if user was attempting to visit a specific sub-route
    if (pathname !== '/' && pathname !== '') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.cookies.delete(TOKEN_NAME);
    response.cookies.set(TOKEN_NAME, '', { path: '/', maxAge: 0 });
    return response;
  }

  // 6. If user IS authenticated and visits the root / homepage, automatically take them to their workspace
  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
