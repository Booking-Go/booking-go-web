'use client';

import { useEffect, useState, useCallback } from 'react';
import { notificationApi } from '@/lib/notification';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification, PaginationMeta } from '@/types';

/** Map notification type to an icon and color. */
const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  booking_created: { icon: Calendar, color: 'text-blue-500' },
  booking_confirmed: { icon: CheckCircle2, color: 'text-green-500' },
  booking_cancelled: { icon: XCircle, color: 'text-red-500' },
  booking_completed: { icon: CheckCircle2, color: 'text-emerald-500' },
  booking_reminder: { icon: Calendar, color: 'text-amber-500' },
  review_received: { icon: Star, color: 'text-yellow-500' },
  business_update: { icon: Store, color: 'text-purple-500' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationApi.list({ page, limit: 20 });
      setNotifications(result.notifications);
      setMeta(result.meta);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
        ),
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })),
      );
      toast.success('All notifications marked as read');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error?.response?.data?.error?.message || 'Failed to mark all as read');
    } finally {
      setMarkingAll(false);
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            )}
            Mark all as read
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
            <p className="mt-3 text-sm text-muted-foreground">
              No notifications yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const cfg = typeConfig[notification.type] || { icon: Bell, color: 'text-muted-foreground' };
            const Icon = cfg.icon;

            return (
              <Card
                key={notification.id}
                className={cn(
                  'transition-colors',
                  !notification.isRead && 'border-primary/20 bg-primary/[0.03]',
                )}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={cn('mt-0.5 shrink-0', cfg.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={cn('text-sm', !notification.isRead && 'font-semibold')}>
                          {notification.title}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleMarkAsRead(notification.id)}
                      aria-label="Mark as read"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                    </Button>
                  )}
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
