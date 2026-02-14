/**
 * Centralized route configuration for the Booking.go platform.
 *
 * Single source of truth for route access rules, consumed by both
 * Next.js middleware (server-side) and client-side auth guards.
 *
 * Route types:
 *  - PUBLIC     → accessible by everyone, no auth required
 *  - AUTH       → auth pages (login, register) — redirect to dashboard if already signed in
 *  - PROTECTED  → requires authentication (any role)
 *  - CUSTOMER   → requires customer role
 *  - BUSINESS   → requires business_owner role
 */

/** Access level for a route or route prefix. */
export type RouteAccess = 'public' | 'auth' | 'protected' | 'customer' | 'business';

/** A route rule — either an exact path or a prefix match. */
interface RouteRule {
  path: string;
  access: RouteAccess;
  /** If true, matches all paths starting with `path` (default: false → exact match). */
  prefix?: boolean;
}

/**
 * Route rules evaluated top-to-bottom. First match wins.
 * More specific rules should come before broader ones.
 */
export const ROUTE_RULES: RouteRule[] = [
  // ─── Auth pages (redirect away if already signed in) ──────────────
  { path: '/login', access: 'auth' },
  { path: '/register', access: 'auth' },
  { path: '/forgot-password', access: 'auth' },
  { path: '/reset-password', access: 'auth' },

  // ─── Dashboard (requires authentication) ──────────────────────────
  // Business-owner only pages
  { path: '/dashboard/businesses', access: 'business', prefix: true },
  { path: '/dashboard/analytics', access: 'business', prefix: true },

  // Any authenticated user
  { path: '/dashboard', access: 'protected', prefix: true },

  // ─── Marketing / public pages ─────────────────────────────────────
  { path: '/', access: 'public' },
  { path: '/explore', access: 'public', prefix: true },
  { path: '/about', access: 'public' },
  { path: '/contact', access: 'public' },
  { path: '/privacy', access: 'public' },
  { path: '/terms', access: 'public' },
];

/**
 * Resolve the access level for a given pathname.
 * Falls back to 'public' if no rule matches.
 */
export const getRouteAccess = (pathname: string): RouteAccess => {
  for (const rule of ROUTE_RULES) {
    if (rule.prefix) {
      if (pathname === rule.path || pathname.startsWith(`${rule.path}/`)) {
        return rule.access;
      }
    } else {
      if (pathname === rule.path) {
        return rule.access;
      }
    }
  }
  return 'public';
};

/** Default redirect targets after authentication. */
export const DEFAULT_REDIRECTS = {
  customer: '/explore',
  business_owner: '/dashboard',
  fallback: '/dashboard',
} as const;

/** Check if a route is fully public (no auth needed at all). */
export const isPublicRoute = (pathname: string): boolean => {
  const access = getRouteAccess(pathname);
  return access === 'public';
};

/** Check if a route is an auth page (login, register, etc.). */
export const isAuthRoute = (pathname: string): boolean => {
  const access = getRouteAccess(pathname);
  return access === 'auth';
};
