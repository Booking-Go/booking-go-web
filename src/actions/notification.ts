'use server';

import { serverFetch, serverFetchPaginated, type ActionResult } from '@/lib/server-api';
import { revalidatePath } from 'next/cache';
import type { Notification, PaginationMeta } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface NotificationsResult {
  notifications: Notification[];
  meta: PaginationMeta;
}

// ─── Read operations ────────────────────────────────────────────────────────

/** Get paginated notifications for the current user. */
export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<ActionResult<NotificationsResult>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.unreadOnly) searchParams.set('unreadOnly', 'true');

    const qs = searchParams.toString();
    const result = await serverFetchPaginated<Notification[]>(
      `/users/me/notifications${qs ? `?${qs}` : ''}`
    );
    return { success: true, data: { notifications: result.data, meta: result.meta } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch notifications',
    };
  }
}

/** Get the count of unread notifications. */
export async function getUnreadNotificationCount(): Promise<ActionResult<number>> {
  try {
    const data = await serverFetch<{ count: number }>('/users/me/notifications/unread-count');
    return { success: true, data: data.count };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch unread count',
    };
  }
}

// ─── Write operations ───────────────────────────────────────────────────────

/** Mark a single notification as read. */
export async function markNotificationAsRead(notificationId: string): Promise<ActionResult<void>> {
  try {
    await serverFetch<void>(`/users/me/notifications/${notificationId}/read`, { method: 'PUT' });
    revalidatePath('/dashboard');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to mark as read' };
  }
}

/** Mark all notifications as read. */
export async function markAllNotificationsAsRead(): Promise<ActionResult<void>> {
  try {
    await serverFetch<void>('/users/me/notifications/read-all', { method: 'PUT' });
    revalidatePath('/dashboard');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to mark all as read',
    };
  }
}

/** Delete a single notification. */
export async function deleteNotification(notificationId: string): Promise<ActionResult<void>> {
  try {
    await serverFetch<void>(`/users/me/notifications/${notificationId}`, { method: 'DELETE' });
    revalidatePath('/dashboard');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete notification',
    };
  }
}

/** Clear all notifications. */
export async function clearAllNotifications(): Promise<ActionResult<void>> {
  try {
    await serverFetch<void>('/users/me/notifications', { method: 'DELETE' });
    revalidatePath('/dashboard');
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to clear notifications',
    };
  }
}

// ─── Push notification (FCM) token management ───────────────────────────────

/** Register an FCM device token with the backend. */
export async function registerDeviceToken(
  token: string,
  deviceType: 'web' | 'android' | 'ios' = 'web'
): Promise<ActionResult<void>> {
  try {
    await serverFetch<void>('/users/me/device-tokens', {
      method: 'POST',
      body: JSON.stringify({ token, deviceType }),
    });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to register device token',
    };
  }
}

/** Unregister an FCM device token. */
export async function unregisterDeviceToken(token: string): Promise<ActionResult<void>> {
  try {
    await serverFetch<void>('/users/me/device-tokens', {
      method: 'DELETE',
      body: JSON.stringify({ token }),
    });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to unregister device token',
    };
  }
}
