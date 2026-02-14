'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  getConversations,
  getMessages,
  markConversationAsRead,
  sendMessage,
} from '@/actions/message';
import { useSocket } from '@/lib/use-socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, MessageSquare, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Conversation, ChatMessage, PaginationMeta } from '@/types';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const openConversationId = searchParams.get('open');
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage: socketSend,
    sendTyping,
    on,
  } = useSocket();

  // Conversation list
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convMeta, setConvMeta] = useState<PaginationMeta | null>(null);
  const [convPage, setConvPage] = useState(1);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Active chat
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgMeta, setMsgMeta] = useState<PaginationMeta | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOwner = user?.role === 'business_owner';

  // ─── Load conversations ─────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const result = await getConversations({ page: convPage, limit: 20 });
      if (result.success) {
        setConversations(result.data.conversations);
        setConvMeta(result.data.meta);
      } else {
        toast.error(result.error);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  }, [convPage]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ─── Load messages for active conversation ──────────────────────────
  const loadMessages = useCallback(async (conversationId: string, page = 1) => {
    if (page === 1) setLoadingMessages(true);
    else setLoadingMore(true);
    try {
      const result = await getMessages(conversationId, { page, limit: 50 });
      if (result.success) {
        if (page === 1) {
          setMessages(result.data.messages.reverse());
        } else {
          setMessages((prev) => [...result.data.messages.reverse(), ...prev]);
        }
        setMsgMeta(result.data.meta);
      } else {
        toast.error(result.error);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
      setLoadingMore(false);
    }
  }, []);

  // ─── Open a conversation ───────────────────────────────────────────
  const openConversation = useCallback(
    (conv: Conversation) => {
      // Leave previous room
      if (activeConversation) {
        leaveConversation(activeConversation.id);
      }

      setActiveConversation(conv);
      setMessages([]);
      setMsgMeta(null);
      setNewMessage('');
      setOtherTyping(false);

      // Join room & load messages
      joinConversation(conv.id);
      loadMessages(conv.id);

      // Mark as read
      markConversationAsRead(conv.id).catch(() => {});
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
      );
    },
    [activeConversation, joinConversation, leaveConversation, loadMessages]
  );

  // ─── Auto-open conversation from query param ────────────────────────
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (
      openConversationId &&
      !autoOpenedRef.current &&
      conversations.length > 0 &&
      !loadingConversations
    ) {
      const target = conversations.find((c) => c.id === openConversationId);
      if (target) {
        openConversation(target);
        autoOpenedRef.current = true;
      }
    }
  }, [openConversationId, conversations, loadingConversations, openConversation]);

  // ─── Real-time events ──────────────────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;

    const unsubMessage = on('message:received', (message: ChatMessage) => {
      if (activeConversation && message.conversationId === activeConversation.id) {
        setMessages((prev) => {
          // Deduplicate: skip if message already exists (from optimistic send or duplicate event)
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        // Auto mark as read if it's from the other party
        if (message.senderId !== user?.id) {
          markConversationAsRead(activeConversation.id).catch(() => {});
        }
      }
    });

    const unsubConvUpdated = on('conversation:updated', (data) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === data.conversationId) {
            const isActive = activeConversation?.id === data.conversationId;
            return {
              ...c,
              lastMessageText: data.lastMessageText,
              lastMessageAt: data.lastMessageAt,
              unreadCount: isActive ? c.unreadCount : c.unreadCount + 1,
            };
          }
          return c;
        })
      );
    });

    const unsubTyping = on('message:typing', (data) => {
      if (data.userId !== user?.id) {
        setOtherTyping(data.isTyping);
      }
    });

    return () => {
      unsubMessage();
      unsubConvUpdated();
      unsubTyping();
    };
  }, [isConnected, on, activeConversation, user?.id]);

  // ─── Re-join room on reconnect ────────────────────────────────────
  // Socket.IO clears server-side rooms on disconnect; re-join on reconnect
  useEffect(() => {
    if (!isConnected || !activeConversation) return;
    joinConversation(activeConversation.id);
  }, [isConnected, activeConversation, joinConversation]);

  // ─── Scroll to bottom on new messages ──────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Send message ─────────────────────────────────────────────────
  const handleSend = async () => {
    if (!newMessage.trim() || !activeConversation || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Clear typing indicator
    sendTyping(activeConversation.id, false);

    // Try socket first, fallback to REST
    if (isConnected) {
      socketSend(activeConversation.id, content, (response) => {
        if (response.success && response.data) {
          // Add own message to state from callback (don't wait for event)
          setMessages((prev) => {
            if (prev.some((m) => m.id === response.data!.id)) return prev;
            return [...prev, response.data!];
          });
        } else if (!response.success) {
          // Fallback to REST
          sendMessage(activeConversation.id, content)
            .then((result) => {
              if (result.success) {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === result.data.id)) return prev;
                  return [...prev, result.data];
                });
              } else {
                toast.error('Failed to send message');
                setNewMessage(content);
              }
            })
            .catch(() => {
              toast.error('Failed to send message');
              setNewMessage(content);
            });
        }
        setSending(false);
      });
    } else {
      try {
        const result = await sendMessage(activeConversation.id, content);
        if (result.success) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === result.data.id)) return prev;
            return [...prev, result.data];
          });
        } else {
          toast.error('Failed to send message');
          setNewMessage(content);
        }
      } catch {
        toast.error('Failed to send message');
        setNewMessage(content);
      } finally {
        setSending(false);
      }
    }
  };

  // ─── Typing indicator ────────────────────────────────────────────
  const handleInputChange = (value: string) => {
    setNewMessage(value);
    if (!activeConversation) return;

    sendTyping(activeConversation.id, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (activeConversation) {
        sendTyping(activeConversation.id, false);
      }
    }, 2000);
  };

  // ─── Load more messages ──────────────────────────────────────────
  const handleLoadMore = () => {
    if (!activeConversation || !msgMeta || msgMeta.page >= msgMeta.totalPages) return;
    loadMessages(activeConversation.id, msgMeta.page + 1);
  };

  // ─── Time formatter ──────────────────────────────────────────────
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffDays === 0) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) {
      return d.toLocaleDateString(undefined, { weekday: 'short' });
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ─── Back to list (mobile) ──────────────────────────────────────
  const handleBack = () => {
    if (activeConversation) {
      leaveConversation(activeConversation.id);
    }
    setActiveConversation(null);
    setMessages([]);
    loadConversations();
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <PageHeader
        title="Messages"
        description="Chat with businesses or customers before booking."
      />

      <div className="mt-4 flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border/40">
        {/* ── Conversation list (hidden on mobile when chat is open) ── */}
        <div
          className={cn(
            'w-full shrink-0 border-r border-border/40 md:w-80',
            activeConversation ? 'hidden md:block' : 'block'
          )}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border/40 px-4 py-3">
              <h2 className="text-sm font-semibold">Conversations</h2>
              {isConnected && (
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted-foreground">Online</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">No conversations yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isOwner
                      ? 'Customers will contact you here.'
                      : 'Message a business from their page.'}
                  </p>
                </div>
              ) : (
                <>
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => openConversation(conv)}
                      className={cn(
                        'flex w-full items-start gap-3 border-b border-border/20 px-4 py-3 text-left transition-colors hover:bg-accent/50',
                        activeConversation?.id === conv.id && 'bg-accent/70'
                      )}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {isOwner
                          ? conv.customerName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                          : conv.businessName[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm font-medium">
                            {isOwner ? conv.customerName : conv.businessName}
                          </span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="truncate text-xs text-muted-foreground">
                            {conv.lastMessageText || 'No messages yet'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="ml-1 h-5 min-w-5 shrink-0 px-1.5 text-[10px]"
                            >
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {isOwner && (
                          <span className="text-[10px] text-muted-foreground/70">
                            {conv.businessName}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}

                  {/* Pagination */}
                  {convMeta && convMeta.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1 p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setConvPage((p) => Math.max(1, p - 1))}
                        disabled={convPage <= 1}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-[10px] text-muted-foreground">
                        {convPage}/{convMeta.totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setConvPage((p) => p + 1)}
                        disabled={convPage >= convMeta.totalPages}
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Chat panel ── */}
        <div
          className={cn('flex flex-1 flex-col', !activeConversation ? 'hidden md:flex' : 'flex')}
        >
          {!activeConversation ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                Select a conversation to start chatting
              </p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:hidden"
                  onClick={handleBack}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {isOwner
                    ? activeConversation.customerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                    : activeConversation.businessName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {isOwner ? activeConversation.customerName : activeConversation.businessName}
                  </p>
                  {otherTyping && <p className="text-xs text-primary animate-pulse">typing...</p>}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {/* Load more */}
                    {msgMeta && msgMeta.page < msgMeta.totalPages && (
                      <div className="mb-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                        >
                          {loadingMore ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          Load earlier messages
                        </Button>
                      </div>
                    )}

                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          No messages yet. Say hi!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => {
                          const isMine = msg.senderId === user?.id;
                          return (
                            <div
                              key={msg.id}
                              className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
                            >
                              <div
                                className={cn(
                                  'max-w-[75%] rounded-2xl px-4 py-2',
                                  isMine
                                    ? 'rounded-br-md bg-primary text-primary-foreground'
                                    : 'rounded-bl-md bg-muted'
                                )}
                              >
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                  {msg.content}
                                </p>
                                <p
                                  className={cn(
                                    'mt-1 text-right text-[10px]',
                                    isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                  )}
                                >
                                  {formatMessageTime(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message input */}
              <div className="border-t border-border/40 px-4 py-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={newMessage}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={2000}
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim() || sending}
                    aria-label="Send message"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
                <p className="mt-1 text-right text-[10px] text-muted-foreground">
                  {newMessage.length}/2000
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
