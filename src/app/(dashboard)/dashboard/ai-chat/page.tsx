'use client';

import { useEffect, useState, useCallback, useRef, type FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuthStore } from '@/store/authStore';
import { useAiChatStore } from '@/store/aiChatStore';
import { getAiChatHistory, getAiChatSession, endAiChatSession } from '@/actions/ai-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Bot,
  Loader2,
  MessageSquarePlus,
  Send,
  Sparkles,
  Trash2,
  User,
  History,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AiChatMessage, AiConversationSummary, PaginationMeta } from '@/types';

// ─── Message Bubble ───────────────────────────────────

interface MessageBubbleProps {
  message: AiChatMessage;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            'text-xs',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        ) : message.content.length === 0 ? (
          <span className="inline-block h-4 w-1.5 animate-pulse rounded-sm bg-foreground/60" />
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>,
                ol: ({ children }) => (
                  <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>
                ),
                li: ({ children }) => <li className="mb-0.5">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  return isBlock ? (
                    <code className="block rounded bg-background/50 p-2 text-xs">{children}</code>
                  ) : (
                    <code className="rounded bg-background/50 px-1 py-0.5 text-xs">{children}</code>
                  );
                },
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <p
          className={cn(
            'mt-1.5 text-[10px]',
            isUser ? 'text-primary-foreground/60' : 'text-muted-foreground'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};

// ─── Typing Indicator ─────────────────────────────────

const TypingIndicator = () => (
  <div className="flex gap-3">
    <Avatar className="h-8 w-8 shrink-0">
      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
        <Bot className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
    <div className="rounded-2xl bg-muted px-4 py-3">
      <div className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

// ─── Suggestion Chips ─────────────────────────────────

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled: boolean;
}

const SuggestionChips = ({ suggestions, onSelect, disabled }: SuggestionChipsProps) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-1">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────

const EmptyChat = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-600/10">
      <Sparkles className="h-8 w-8 text-violet-500" />
    </div>
    <div>
      <h3 className="text-lg font-semibold">AI Assistant</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Ask me anything about businesses, check availability, get recommendations, or make bookings.
        I&apos;m here to help!
      </p>
    </div>
    <div className="mt-2 flex flex-wrap justify-center gap-2">
      {[
        'Find me a salon nearby',
        'Show available appointments',
        'Recommend a spa',
        'View my bookings',
      ].map((suggestion) => (
        <Badge
          key={suggestion}
          variant="outline"
          className="cursor-default text-xs font-normal text-muted-foreground"
        >
          &ldquo;{suggestion}&rdquo;
        </Badge>
      ))}
    </div>
  </div>
);

// ─── History Sidebar ──────────────────────────────────

interface HistorySidebarProps {
  conversations: AiConversationSummary[];
  meta: PaginationMeta | null;
  loading: boolean;
  onSelect: (sessionId: string) => void;
  onNewChat: () => void;
  activeSessionId: string | null;
  onClose: () => void;
}

const HistorySidebar = ({
  conversations,
  meta,
  loading,
  onSelect,
  onNewChat,
  activeSessionId,
  onClose,
}: HistorySidebarProps) => (
  <div className="flex h-full flex-col">
    <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
      <h3 className="text-sm font-semibold">Chat History</h3>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNewChat}>
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>

    <ScrollArea className="flex-1">
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">
          No chat history yet
        </div>
      ) : (
        <div className="flex flex-col gap-0.5 p-2">
          {conversations.map((conv) => (
            <button
              key={conv.sessionId}
              type="button"
              onClick={() => onSelect(conv.sessionId)}
              className={cn(
                'w-full rounded-lg px-3 py-2.5 text-left transition-colors',
                conv.sessionId === activeSessionId
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <p className="truncate text-sm font-medium">
                {conv.lastMessage || 'New conversation'}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px]">
                <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                <span>·</span>
                <span>{conv.messageCount} messages</span>
                {conv.status === 'closed' && (
                  <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                    Closed
                  </Badge>
                )}
              </div>
            </button>
          ))}
          {meta && meta.page < meta.totalPages && (
            <p className="py-2 text-center text-xs text-muted-foreground">
              Showing {conversations.length} of {meta.total}
            </p>
          )}
        </div>
      )}
    </ScrollArea>
  </div>
);

// ─── Main Page ────────────────────────────────────────

export default function AiChatPage() {
  const { user } = useAuthStore();
  const {
    sessionId,
    messages,
    isLoading,
    isStreaming,
    suggestions,
    addUserMessage,
    startAssistantStream,
    appendToStream,
    finalizeStream,
    setLoading,
    setSession,
    clearSession,
  } = useAiChatStore();

  const [inputValue, setInputValue] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<AiConversationSummary[]>([]);
  const [convMeta, setConvMeta] = useState<PaginationMeta | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom on new messages or streaming tokens
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isStreaming]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ─── Load history ───────────────────────────────────
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const result = await getAiChatHistory({ page: 1, limit: 30 });
      if (result.success) {
        setConversations(result.data.conversations);
        setConvMeta(result.data.meta);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to load chat history');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Load history when sidebar opens
  useEffect(() => {
    if (showHistory) {
      loadHistory();
    }
  }, [showHistory, loadHistory]);

  // ─── Send message (streaming via SSE) ────────────────
  const handleSend = useCallback(
    async (messageText?: string) => {
      const text = (messageText || inputValue).trim();
      if (!text || isLoading || isStreaming) return;

      setInputValue('');
      addUserMessage(text);
      setLoading(true);

      // Abort any in-flight stream
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/ai/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, sessionId: sessionId || undefined }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setLoading(false);
          toast.error(err?.error || 'AI chat failed');
          return;
        }

        // Start an empty assistant bubble and switch to streaming mode
        startAssistantStream();

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let streamSessionId = sessionId || '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events (split on double newline)
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            const lines = part.split('\n');
            let eventType = '';
            let data = '';

            for (const line of lines) {
              if (line.startsWith('event: ')) eventType = line.slice(7);
              if (line.startsWith('data: ')) data = line.slice(6);
            }

            if (!data) continue;

            try {
              const parsed = JSON.parse(data);

              switch (eventType) {
                case 'meta':
                  streamSessionId = parsed.sessionId || streamSessionId;
                  break;
                case 'token':
                  appendToStream(parsed.token);
                  break;
                case 'done':
                  finalizeStream(streamSessionId, parsed.suggestions || []);
                  break;
                case 'error':
                  finalizeStream(streamSessionId, []);
                  toast.error(parsed.error || 'AI chat failed');
                  break;
              }
            } catch {
              // Ignore malformed SSE data
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setLoading(false);
        toast.error('Failed to send message');
      }
    },
    [
      inputValue,
      isLoading,
      isStreaming,
      sessionId,
      addUserMessage,
      startAssistantStream,
      appendToStream,
      finalizeStream,
      setLoading,
    ]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  // ─── Load a past session ────────────────────────────
  const handleSelectSession = useCallback(
    async (selectedSessionId: string) => {
      try {
        const result = await getAiChatSession(selectedSessionId);
        if (result.success) {
          setSession(result.data.sessionId, result.data.messages);
          setShowHistory(false);
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error('Failed to load session');
      }
    },
    [setSession]
  );

  // ─── New chat ───────────────────────────────────────
  const handleNewChat = useCallback(() => {
    clearSession();
    setShowHistory(false);
    inputRef.current?.focus();
  }, [clearSession]);

  // ─── End session ────────────────────────────────────
  const handleEndSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      await endAiChatSession(sessionId);
      clearSession();
      toast.success('Chat session ended');
    } catch {
      toast.error('Failed to end session');
    }
  }, [sessionId, clearSession]);

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <PageHeader
        title="AI Assistant"
        description="Chat with BookingBot to search, book, and manage appointments"
      />

      <div className="mt-4 flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border/40">
        {/* ── History Sidebar (desktop always, mobile toggle) ── */}
        <div
          className={cn(
            'shrink-0 border-r border-border/40 bg-card',
            showHistory
              ? 'fixed inset-0 z-50 w-full md:relative md:block md:w-72'
              : 'hidden md:block md:w-72'
          )}
        >
          <HistorySidebar
            conversations={conversations}
            meta={convMeta}
            loading={loadingHistory}
            onSelect={handleSelectSession}
            onNewChat={handleNewChat}
            activeSessionId={sessionId}
            onClose={() => setShowHistory(false)}
          />
        </div>

        {/* ── Main Chat Area ── */}
        <div className="flex flex-1 flex-col">
          {/* Header bar */}
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                onClick={() => setShowHistory(true)}
              >
                <History className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">BookingBot</p>
                  <p className="text-[11px] text-muted-foreground">
                    {isStreaming ? 'Typing...' : isLoading ? 'Thinking...' : 'Online'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNewChat}
                title="New chat"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </Button>
              {sessionId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={handleEndSession}
                  title="End session"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Messages area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            {messages.length === 0 && !isLoading ? (
              <EmptyChat />
            ) : (
              <div className="flex flex-col gap-4 p-4">
                {messages.map((msg, idx) => (
                  <MessageBubble key={`${msg.role}-${idx}`} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
              </div>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && !isLoading && !isStreaming && (
            <div className="border-t border-border/40 px-4 py-2">
              <SuggestionChips
                suggestions={suggestions}
                onSelect={(s) => handleSend(s)}
                disabled={isLoading || isStreaming}
              />
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-border/40 p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder='Ask anything... e.g., "Find me a salon near Mumbai"'
                disabled={isLoading || isStreaming}
                className="flex-1"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || isStreaming || !inputValue.trim()}
                className="shrink-0"
              >
                {isLoading || isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
