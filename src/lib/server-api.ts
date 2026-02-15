import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL!;

/**
 * Server-side fetch wrapper for use in Server Actions and Server Components.
 * Reads the accessToken cookie set by the Zustand auth store and forwards it
 * to the backend as a Bearer token.
 *
 * Benefits over client-side apiClient:
 *  - Runs on the Node.js server → doesn't expose tokens to the browser network tab
 *  - Can call the backend directly (no proxy hop)
 *  - Works with `revalidatePath` / `revalidateTag` for cache invalidation
 */

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function serverFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMessage =
      body?.error?.message || body?.message || `Request failed with status ${res.status}`;
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(`[serverFetch] ${options.method || 'GET'} ${path} → ${res.status}`, {
        error: body?.error || body,
        status: res.status,
      });
    }
    throw new Error(errorMessage);
  }

  return body.data as T;
}

/**
 * Server-side fetch for paginated endpoints that return `{ data, meta }` at the top level.
 * Returns both the data array and pagination metadata.
 */
export async function serverFetchPaginated<T, M = PaginationMeta>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T; meta: M }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMessage =
      body?.error?.message || body?.message || `Request failed with status ${res.status}`;
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(`[serverFetchPaginated] ${options.method || 'GET'} ${path} → ${res.status}`, {
        error: body?.error || body,
        status: res.status,
      });
    }
    throw new Error(errorMessage);
  }

  return { data: body.data as T, meta: body.meta as M };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
