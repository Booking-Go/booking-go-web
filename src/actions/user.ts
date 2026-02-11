'use server';

import { serverFetch, type ActionResult } from '@/lib/server-api';
import type { User } from '@/types';

export async function getProfile(): Promise<ActionResult<User>> {
  try {
    const data = await serverFetch<User>('/users/me');
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch profile' };
  }
}

export async function updateProfile(
  payload: Partial<{ firstName: string; lastName: string; phone: string; timezone: string; language: string }>,
): Promise<ActionResult<User>> {
  try {
    const data = await serverFetch<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update profile' };
  }
}
