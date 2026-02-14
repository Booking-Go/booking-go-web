import { serverFetchPaginated } from '@/lib/server-api';
import { NotificationFeed } from './_components/feed';
import type { Notification, PaginationMeta } from '@/types';

/**
 * Notifications page — Server Component.
 * Fetches the initial notification list server-side so data is available on first render.
 */
export default async function NotificationsPage() {
  let notifications: Notification[] = [];
  let meta: PaginationMeta = { total: 0, page: 1, limit: 20, totalPages: 0 };

  try {
    const result = await serverFetchPaginated<Notification[]>(
      '/users/me/notifications?page=1&limit=20'
    );
    notifications = result.data;
    meta = result.meta;
  } catch {
    // Fallback to empty — client component can retry
  }

  return <NotificationFeed initialNotifications={notifications} initialMeta={meta} />;
}
