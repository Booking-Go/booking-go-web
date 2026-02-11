'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import type { ChatMessage } from '@/types';

/** The backend URL for the Socket.IO connection (same origin via proxy). */
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

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
  'conversation:read': (data: {
    conversationId: string;
    readBy: string;
  }) => void;
}

/** Events emitted by the client. */
interface ClientEvents {
  'conversation:join': (conversationId: string) => void;
  'conversation:leave': (conversationId: string) => void;
  'message:send': (
    data: { conversationId: string; content: string },
    callback?: (response: { success: boolean; data?: ChatMessage; error?: string }) => void,
  ) => void;
  'message:typing': (data: { conversationId: string; isTyping: boolean }) => void;
  'conversation:read': (conversationId: string) => void;
}

type TypedSocket = Socket<ServerEvents, ClientEvents>;

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

    const socket: TypedSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
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
      callback?: (response: { success: boolean; data?: ChatMessage; error?: string }) => void,
    ) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('message:send', { conversationId, content }, callback);
      } else if (callback) {
        callback({ success: false, error: 'Socket not connected' });
      }
    },
    [],
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
  const on = useCallback(
    <E extends keyof ServerEvents>(event: E, handler: ServerEvents[E]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socketRef.current?.on(event, handler as any);
      return () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketRef.current?.off(event, handler as any);
      };
    },
    [],
  );

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
