import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRouteAccess, DEFAULT_REDIRECTS } from '@/lib/routes';

/**
 * Next.js Middleware — runs on the Edge before every matched route.
 *
 * Uses the centralized route config in `src/lib/routes.ts` to decide:
 *  - 'public'     → allow through (no auth check)
 *  - 'auth'       → redirect to dashboard if already signed in
 *  - 'protected'  → redirect to login if no session
 *  - 'customer'   → redirect to login if no session (role checked client-side)
 *  - 'business'   → redirect to login if no session (role checked client-side)
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get('session')?.value === '1';
  const access = getRouteAccess(pathname);

  switch (access) {
    case 'public':
      return NextResponse.next();

    case 'auth':
      // Already signed in → send to dashboard
      if (hasSession) {
        return NextResponse.redirect(new URL(DEFAULT_REDIRECTS.fallback, request.url));
      }
      return NextResponse.next();

    case 'protected':
    case 'customer':
    case 'business':
      // Not signed in → redirect to login with callbackUrl
      if (!hasSession) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();

    default:
      return NextResponse.next();
  }
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
