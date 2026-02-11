import apiClient from './api';
import type { Notification, PaginationMeta } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedApiResponse<T> {
  success: boolean;
  data: T;
  meta: PaginationMeta;
}

// ─── API calls ──────────────────────────────────────────────────────────────

export const notificationApi = {
  /** Get paginated notifications for the current user. */
  async list(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<{ notifications: Notification[]; meta: PaginationMeta }> {
    const { data } = await apiClient.get<PaginatedApiResponse<Notification[]>>(
      '/users/me/notifications',
      { params },
    );
    return { notifications: data.data, meta: data.meta };
  },

  /** Get the count of unread notifications. */
  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<ApiResponse<{ count: number }>>(
      '/users/me/notifications/unread-count',
    );
    return data.data.count;
  },

  /** Mark a single notification as read. */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`/users/me/notifications/${notificationId}/read`);
  },

  /** Mark all notifications as read. */
  async markAllAsRead(): Promise<void> {
    await apiClient.put('/users/me/notifications/read-all');
  },
};
