import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware — runs on the Edge before every matched route.
 *
 * Responsibilities:
 *  1. Protect /dashboard/* — redirect to /login if no session cookie
 *  2. Redirect authenticated users away from /login, /register to /dashboard
 */

const PUBLIC_AUTH_ROUTES = ['/login', '/register', '/forgot-password'];
const PROTECTED_PREFIX = '/dashboard';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get('session')?.value === '1';

  // ── Protected routes (dashboard/*) ────────────────────────────────────
  if (pathname.startsWith(PROTECTED_PREFIX)) {
    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Auth routes (login, register) — redirect if already signed in ────
  if (PUBLIC_AUTH_ROUTES.some((route) => pathname === route)) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     *  - _next/static (static files)
     *  - _next/image (image optimization)
     *  - favicon.ico, public assets
     *  - API proxy routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
