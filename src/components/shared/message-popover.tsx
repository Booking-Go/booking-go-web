'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getConversations, markConversationAsRead } from '@/actions/message';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MessageSquare, ArrowRight } from 'lucide-react';
import type { Conversation } from '@/types';

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

/** Relative time formatter. */
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

/** Extract initials from a name. */
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.[0] ?? 'U').toUpperCase();
};

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────

interface MessagePopoverProps {
  /** Current total unread message count — controls the badge. */
  unreadCount: number;
  /** Called after marking conversations as read so parent can refresh count. */
  onCountChange: () => void;
}

/**
 * Message icon button with a popover dropdown showing recent conversations.
 * Fetches the latest 5 conversations on open with quick navigation to chat.
 */
export function MessagePopover({ unreadCount, onCountChange }: MessagePopoverProps) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  const isOwner = user?.role === 'business_owner';

  /** Fetch the latest conversations when the popover opens. */
  const fetchRecent = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getConversations({ page: 1, limit: 5 });
      if (result.success) {
        setConversations(result.data.conversations);
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

  /** Navigate to the conversation and mark as read. */
  const handleConversationClick = async (conv: Conversation) => {
    setOpen(false);
    if (conv.unreadCount > 0) {
      markConversationAsRead(conv.id).then(() => onCountChange());
    }
    router.push(`/dashboard/messages?open=${conv.id}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label="Messages">
          <MessageSquare className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-80 p-0 sm:w-96">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Messages</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {unreadCount} unread
            </span>
          )}
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="space-y-1 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 rounded-lg p-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Start a conversation from a business page
              </p>
            </div>
          ) : (
            <div className="py-1">
              {conversations.map((conv) => {
                const displayName = isOwner ? conv.customerName : conv.businessName;
                const initials = getInitials(displayName);
                const hasUnread = conv.unreadCount > 0;

                return (
                  <button
                    key={conv.id}
                    className={cn(
                      'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50',
                      hasUnread && 'bg-primary/[0.03]'
                    )}
                    onClick={() => handleConversationClick(conv)}
                  >
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            'truncate text-sm',
                            hasUnread ? 'font-semibold' : 'font-medium text-muted-foreground'
                          )}
                        >
                          {displayName}
                        </p>
                        <span className="shrink-0 text-[10px] text-muted-foreground/70">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <p
                          className={cn(
                            'flex-1 truncate text-xs',
                            hasUnread ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {conv.lastMessageText}
                        </p>
                        {hasUnread && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                            {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                          </span>
                        )}
                      </div>
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
            href="/dashboard/messages"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1 py-1 text-xs font-medium text-primary hover:underline"
          >
            View all messages
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
