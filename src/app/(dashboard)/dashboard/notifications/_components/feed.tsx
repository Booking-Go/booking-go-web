'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from '@/actions/notification';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared';
import { toast } from 'sonner';
import {
  Bell,
  BellOff,
  Calendar,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  Store,
  Trash2,
  XCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationType } from '@/lib/constants';
import type { Notification, PaginationMeta } from '@/types';

/** Map notification type to an icon, color, and human-readable label. */
const typeConfig: Record<
  string,
  { icon: typeof Bell; color: string; bgColor: string; label: string }
> = {
  [NotificationType.BOOKING_CREATED]: {
    icon: Calendar,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'New Booking',
  },
  [NotificationType.BOOKING_CONFIRMED]: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Confirmed',
  },
  [NotificationType.BOOKING_CANCELLED]: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Cancelled',
  },
  [NotificationType.BOOKING_COMPLETED]: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    label: 'Completed',
  },
  [NotificationType.BOOKING_REMINDER]: {
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'Reminder',
  },
  [NotificationType.REVIEW_RECEIVED]: {
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    label: 'Review',
  },
  [NotificationType.BUSINESS_UPDATE]: {
    icon: Store,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    label: 'Update',
  },
};

const fallbackConfig = {
  icon: Bell,
  color: 'text-muted-foreground',
  bgColor: 'bg-muted',
  label: 'Notification',
};

/**
 * Build a deep-link path for a notification based on its type and metadata.
 */
const getNotificationLink = (notif: Notification): string | null => {
  const bookingId = notif.data?.bookingId as string | undefined;

  switch (notif.type) {
    case NotificationType.BOOKING_CREATED:
    case NotificationType.BOOKING_CONFIRMED:
    case NotificationType.BOOKING_CANCELLED:
    case NotificationType.BOOKING_COMPLETED:
    case NotificationType.BOOKING_REMINDER:
      return bookingId ? `/dashboard/bookings?highlight=${bookingId}` : '/dashboard/bookings';
    case NotificationType.REVIEW_RECEIVED:
      return '/dashboard/analytics';
    case NotificationType.BUSINESS_UPDATE:
      return '/dashboard/businesses';
    default:
      return null;
  }
};

interface NotificationFeedProps {
  initialNotifications: Notification[];
  initialMeta: PaginationMeta;
}

export function NotificationFeed({ initialNotifications, initialMeta }: NotificationFeedProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  /** Refetch notifications client-side when page changes. */
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getNotifications({ page, limit: 20 });
      if (!result.success) throw new Error(result.error);
      setNotifications(result.data.notifications);
      setMeta(result.data.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page]);

  // Refetch when page changes (skip initial — SSR handled it)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationAsRead(notificationId);
      if (!result.success) throw new Error(result.error);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const result = await markAllNotificationsAsRead();
      if (!result.success) throw new Error(result.error);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      toast.success('All notifications marked as read');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const result = await deleteNotification(notificationId);
      if (!result.success) throw new Error(result.error);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    setClearingAll(true);
    try {
      const result = await clearAllNotifications();
      if (!result.success) throw new Error(result.error);
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to clear notifications');
    } finally {
      setClearingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Notifications"
          description="Stay updated on your bookings and reviews."
        />
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={markingAll}>
            {markingAll ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            )}
            Mark all as read
          </Button>
        )}
        {notifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={clearingAll}
            className="text-destructive hover:text-destructive"
          >
            {clearingAll ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Clear all
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BellOff className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const cfg = typeConfig[notification.type] || fallbackConfig;
            const Icon = cfg.icon;
            const link = getNotificationLink(notification);

            return (
              <Card
                key={notification.id}
                className={cn(
                  'transition-colors',
                  !notification.isRead && 'border-primary/20 bg-primary/[0.03]'
                )}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  {/* Type icon with colored background */}
                  <div
                    className={cn(
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                      cfg.color,
                      cfg.bgColor
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={cn('text-sm', !notification.isRead && 'font-semibold')}>
                            {notification.title}
                          </p>
                          <span
                            className={cn(
                              'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
                              cfg.color,
                              cfg.bgColor
                            )}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-xs text-muted-foreground/70">
                            {formatTime(notification.createdAt)}
                          </span>
                          {link && (
                            <Link
                              href={link}
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                              View details
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-0.5">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleMarkAsRead(notification.id)}
                        aria-label="Mark as read"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(notification.id)}
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= meta.totalPages}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
