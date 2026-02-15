'use server';

import { cookies } from 'next/headers';
import type { ActionResult } from '@/lib/server-api';
import type { UserRoleValue } from '@/lib/constants';

const BACKEND_URL = process.env.BACKEND_URL!;

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRoleValue;
  emailVerified: boolean;
  profileImage?: string;
  timezone: string;
  language: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthData {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface RefreshData {
  accessToken: string;
  refreshToken: string;
}

/**
 * Calls the backend auth endpoint and sets the HttpOnly accessToken cookie
 * from the response on the browser.
 */
async function authFetch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMessage =
      json?.error?.message || json?.message || `Request failed with status ${res.status}`;
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(`[authFetch] POST ${path} → ${res.status}`, {
        error: json?.error || json,
        status: res.status,
      });
    }
    throw new Error(errorMessage);
  }

  // Forward the Set-Cookie header from the backend to the browser
  const setCookie = res.headers.getSetCookie?.();
  if (setCookie) {
    const cookieStore = await cookies();
    for (const raw of setCookie) {
      const [nameValue] = raw.split(';');
      const [name, ...rest] = nameValue.split('=');
      const value = rest.join('=');
      if (name.trim() === 'accessToken') {
        cookieStore.set('accessToken', value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60,
          path: '/',
        });
      }
    }
  }

  return json.data as T;
}

/** Log in a user. Sets the HttpOnly accessToken cookie. */
export async function login(payload: {
  email: string;
  password: string;
}): Promise<ActionResult<AuthData>> {
  try {
    const data = await authFetch<AuthData>('/auth/login', payload);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
  }
}

/** Register a new user. Sets the HttpOnly accessToken cookie. */
export async function register(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRoleValue;
}): Promise<ActionResult<AuthData>> {
  try {
    const data = await authFetch<AuthData>('/auth/register', payload);
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Registration failed' };
  }
}

/** Refresh the access token. Sets the new HttpOnly accessToken cookie. */
export async function refreshToken(token: string): Promise<ActionResult<RefreshData>> {
  try {
    const data = await authFetch<RefreshData>('/auth/refresh', { refreshToken: token });
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Token refresh failed' };
  }
}

/** Log out the current user. Clears the HttpOnly accessToken cookie. */
export async function logout(): Promise<ActionResult<void>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    // Call backend to invalidate refresh token
    if (token) {
      await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });
    }

    // Clear the HttpOnly cookie
    cookieStore.set('accessToken', '', { maxAge: 0, path: '/' });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Logout failed' };
  }
}

/** Request a password reset email. */
export async function forgotPassword(email: string): Promise<ActionResult<{ message: string }>> {
  try {
    const data = await authFetch<{ message: string }>('/auth/forgot-password', { email });
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Request failed' };
  }
}

/** Reset password with a token. */
export async function resetPassword(
  token: string,
  password: string
): Promise<ActionResult<{ message: string }>> {
  try {
    const data = await authFetch<{ message: string }>('/auth/reset-password', { token, password });
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Reset failed' };
  }
}
