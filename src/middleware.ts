import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_NAME = 'nh_session_token';
const JWT_SECRET = process.env.JWT_SECRET || 'niche-hunter-super-secret-jwt-key-2026';

// Cryptographically verify JWT HMAC-SHA256 signature using Web Crypto API (native in Next.js Edge Runtime)
async function verifyJwtInEdge(token: string | undefined): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [headerB64, payloadB64, signatureB64] = parts;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureStr = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const binarySignature = atob(signatureStr);
    const signatureBytes = new Uint8Array(binarySignature.length);
    for (let i = 0; i < binarySignature.length; i++) {
      signatureBytes[i] = binarySignature.charCodeAt(i);
    }

    const dataBytes = enc.encode(`${headerB64}.${payloadB64}`);

    const isValidSig = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      dataBytes
    );

    if (!isValidSig) return false;

    // Decode and parse payload
    const payloadStr = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(payloadStr)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);

    if (!payload || !payload.userId) return false;

    // Check expiration
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

export async function middleware(request: NextRequest) {
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

  const validToken = await verifyJwtInEdge(token);

  // 2. Auth API routes: Allow /api/auth through unconditionally
  if (pathname === '/api/auth' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // 3. Any other API route (/api/*) requires valid authentication
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

  // 4. Handle Root Landing Page (PUBLIC)
  if (pathname === '/' || pathname === '') {
    return NextResponse.next();
  }

  // 5. Handle Login Page (PUBLIC)
  if (pathname === '/login') {
    // If user already has a valid token and did not explicitly request account switch, send to dashboard
    if (validToken && !request.nextUrl.searchParams.has('switch')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 6. Protected routes (like /dashboard, /research, /saved, /admin, etc.):
  // If user is NOT authenticated, redirect seedha to landing page (/)
  if (!validToken) {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    if (token) {
      response.cookies.delete(TOKEN_NAME);
      response.cookies.set(TOKEN_NAME, '', { path: '/', maxAge: 0 });
    }
    return response;
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
