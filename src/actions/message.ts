'use server';

import { serverFetch, serverFetchPaginated, type ActionResult } from '@/lib/server-api';
import { revalidatePath } from 'next/cache';
import type { Conversation, ChatMessage, PaginationMeta } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ConversationsResult {
  conversations: Conversation[];
  meta: PaginationMeta;
}

interface MessagesResult {
  messages: ChatMessage[];
  meta: PaginationMeta;
}

// ─── Read operations ────────────────────────────────────────────────────────

/** List all conversations for the current user. */
export async function getConversations(params?: {
  page?: number;
  limit?: number;
}): Promise<ActionResult<ConversationsResult>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString();
    const result = await serverFetchPaginated<Conversation[]>(
      `/messages/conversations${qs ? `?${qs}` : ''}`
    );
    return { success: true, data: { conversations: result.data, meta: result.meta } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch conversations',
    };
  }
}

/** Get paginated messages for a conversation. */
export async function getMessages(
  conversationId: string,
  params?: { page?: number; limit?: number }
): Promise<ActionResult<MessagesResult>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString();
    const result = await serverFetchPaginated<ChatMessage[]>(
      `/messages/conversations/${conversationId}${qs ? `?${qs}` : ''}`
    );
    return { success: true, data: { messages: result.data, meta: result.meta } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch messages',
    };
  }
}

/** Get total unread message count across all conversations. */
export async function getUnreadMessageCount(): Promise<ActionResult<number>> {
  try {
    const data = await serverFetch<{ count: number }>('/messages/unread-count');
    return { success: true, data: data.count };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch unread count',
    };
  }
}

// ─── Write operations ───────────────────────────────────────────────────────

/** Start or resume a conversation with a business. */
export async function startConversation(payload: {
  businessId: string;
  message?: string;
}): Promise<ActionResult<{ conversation: Conversation; message: ChatMessage }>> {
  try {
    const data = await serverFetch<{ conversation: Conversation; message: ChatMessage }>(
      '/messages/conversations',
      { method: 'POST', body: JSON.stringify(payload) }
    );
    revalidatePath('/dashboard/messages');
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to start conversation',
    };
  }
}

/** Send a message via REST (fallback for when socket is offline). */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<ActionResult<ChatMessage>> {
  try {
    const data = await serverFetch<ChatMessage>(`/messages/conversations/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send message' };
  }
}

/** Mark a conversation as read. */
export async function markConversationAsRead(conversationId: string): Promise<ActionResult<void>> {
  try {
    await serverFetch<void>(`/messages/conversations/${conversationId}/read`, { method: 'PUT' });
    return { success: true, data: undefined };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to mark as read' };
  }
}
