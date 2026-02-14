'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/actions/notification';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Bell,
  Calendar,
  CheckCircle2,
  XCircle,
  Star,
  Store,
  CheckCheck,
  ArrowRight,
} from 'lucide-react';
import type { Notification } from '@/types';

// ────────────────────────────────────────────────────────────────
// Notification type → icon/color mapping
// ────────────────────────────────────────────────────────────────

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  booking_created: {
    icon: <Calendar className="h-4 w-4" />,
    color: 'text-blue-500 bg-blue-500/10',
  },
  booking_confirmed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-green-500 bg-green-500/10',
  },
  booking_cancelled: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'text-red-500 bg-red-500/10',
  },
  booking_completed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-emerald-500 bg-emerald-500/10',
  },
  booking_reminder: {
    icon: <Calendar className="h-4 w-4" />,
    color: 'text-amber-500 bg-amber-500/10',
  },
  review_received: {
    icon: <Star className="h-4 w-4" />,
    color: 'text-yellow-500 bg-yellow-500/10',
  },
  business_update: {
    icon: <Store className="h-4 w-4" />,
    color: 'text-purple-500 bg-purple-500/10',
  },
};

const fallbackConfig = {
  icon: <Bell className="h-4 w-4" />,
  color: 'text-muted-foreground bg-muted',
};

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

/** Relative time formatter — matches the notifications page. */
const formatTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────

interface NotificationPopoverProps {
  /** Current unread count — controls the badge. */
  unreadCount: number;
  /** Called after marking notifications as read so parent can refresh count. */
  onCountChange: () => void;
}

/**
 * Bell icon button with a popover dropdown showing recent notifications.
 * Fetches the latest 5 notifications on open with mark-as-read actions.
 */
export function NotificationPopover({ unreadCount, onCountChange }: NotificationPopoverProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  /** Fetch the latest few notifications when the popover opens. */
  const fetchRecent = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getNotifications({ page: 1, limit: 5 });
      if (result.success) {
        setNotifications(result.data.notifications);
      }
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchRecent();
  }, [open, fetchRecent]);

  /** Mark a single notification as read. */
  const handleMarkRead = async (id: string) => {
    const result = await markNotificationAsRead(id);
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
      onCountChange();
    }
  };

  /** Mark all as read. */
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    const result = await markAllNotificationsAsRead();
    if (result.success) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      onCountChange();
    }
    setMarkingAll(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-80 p-0 sm:w-96">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
              disabled={markingAll}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="space-y-1 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 rounded-lg p-3">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Bell className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notif) => {
                const config = typeConfig[notif.type] ?? fallbackConfig;
                return (
                  <button
                    key={notif.id}
                    className={cn(
                      'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50',
                      !notif.isRead && 'bg-primary/[0.03]'
                    )}
                    onClick={() => {
                      if (!notif.isRead) handleMarkRead(notif.id);
                    }}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        config.color
                      )}
                    >
                      {config.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'truncate text-sm',
                            !notif.isRead ? 'font-semibold' : 'font-medium text-muted-foreground'
                          )}
                        >
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {notif.message}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2">
          <Link
            href="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1 py-1 text-xs font-medium text-primary hover:underline"
          >
            View all notifications
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
