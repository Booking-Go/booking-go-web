import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

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

export async function serverFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
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
    throw new Error(
      body?.error?.message || `Request failed with status ${res.status}`,
    );
  }

  return body.data as T;
}
