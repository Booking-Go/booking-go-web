'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import type { ChatMessage } from '@/types';

/** Events emitted by the server. */
interface ServerEvents {
  'message:received': (message: ChatMessage) => void;
  'message:typing': (data: { userId: string; isTyping: boolean }) => void;
  'conversation:updated': (data: {
    conversationId: string;
    lastMessageText: string;
    lastMessageAt: string;
    senderId: string;
  }) => void;
  'conversation:read': (data: { conversationId: string; readBy: string }) => void;
}

/** Events emitted by the client. */
interface ClientEvents {
  'conversation:join': (conversationId: string) => void;
  'conversation:leave': (conversationId: string) => void;
  'message:send': (
    data: { conversationId: string; content: string },
    callback?: (response: { success: boolean; data?: ChatMessage; error?: string }) => void
  ) => void;
  'message:typing': (data: { conversationId: string; isTyping: boolean }) => void;
  'conversation:read': (conversationId: string) => void;
}

type TypedSocket = Socket<ServerEvents, ClientEvents>;

/** Cached socket URL — fetched once from the server-side runtime config. */
let cachedSocketUrl: string | null = null;

/**
 * Fetches the Socket.IO server URL from the runtime config API.
 * The URL is a server-side env var (BACKEND_URL), not baked at build time.
 */
const getSocketUrl = async (): Promise<string | null> => {
  if (cachedSocketUrl) return cachedSocketUrl;
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data.socketUrl) {
      cachedSocketUrl = data.socketUrl;
      return cachedSocketUrl;
    }
  } catch (err) {
    console.error('[Socket] Failed to fetch socket URL:', err);
  }
  return null;
};

/**
 * Hook that manages a Socket.IO connection for real-time messaging.
 * Automatically connects when authenticated and disconnects on unmount/logout.
 */
export const useSocket = () => {
  const socketRef = useRef<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    let cancelled = false;

    const connect = async () => {
      const socketUrl = await getSocketUrl();
      if (cancelled || !socketUrl) return;

      const socket: TypedSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected:', socket.id);
        setIsConnected(true);
      });

      socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
        setIsConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.error('[Socket] Connection error:', err.message);
      });

      socket.io.on('reconnect', () => {
        console.log('[Socket] Reconnected');
      });

      socketRef.current = socket;
    };

    connect();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user]);

  /** Join a conversation room for real-time updates. */
  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:join', conversationId);
  }, []);

  /** Leave a conversation room. */
  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:leave', conversationId);
  }, []);

  /** Send a message via websocket. Falls back to REST if socket not connected. */
  const sendMessage = useCallback(
    (
      conversationId: string,
      content: string,
      callback?: (response: { success: boolean; data?: ChatMessage; error?: string }) => void
    ) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('message:send', { conversationId, content }, callback);
      } else if (callback) {
        callback({ success: false, error: 'Socket not connected' });
      }
    },
    []
  );

  /** Emit typing indicator. */
  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    socketRef.current?.emit('message:typing', { conversationId, isTyping });
  }, []);

  /** Mark conversation as read via socket. */
  const markRead = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:read', conversationId);
  }, []);

  /** Subscribe to a server event. Returns an unsubscribe function. */
  const on = useCallback(<E extends keyof ServerEvents>(event: E, handler: ServerEvents[E]) => {
    socketRef.current?.on(event, handler as any);
    return () => {
      socketRef.current?.off(event, handler as any);
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    markRead,
    on,
  };
};
