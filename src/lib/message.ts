import apiClient from './api';
import type { Conversation, ChatMessage, PaginationMeta } from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedApiResponse<T> {
  success: boolean;
  data: T;
  meta: PaginationMeta;
}

/** Payload for starting a new conversation. */
export interface StartConversationPayload {
  businessId: string;
  message: string;
}

// ─── API calls ──────────────────────────────────────────────────────────────

export const messageApi = {
  /** Start or resume a conversation with a business, sending the first message. */
  async startConversation(
    payload: StartConversationPayload,
  ): Promise<{ conversation: Conversation; message: ChatMessage }> {
    const { data } = await apiClient.post<
      ApiResponse<{ conversation: Conversation; message: ChatMessage }>
    >('/messages/conversations', payload);
    return data.data;
  },

  /** List all conversations for the current user. */
  async listConversations(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ conversations: Conversation[]; meta: PaginationMeta }> {
    const { data } = await apiClient.get<PaginatedApiResponse<Conversation[]>>(
      '/messages/conversations',
      { params },
    );
    return { conversations: data.data, meta: data.meta };
  },

  /** Get paginated messages for a conversation. */
  async getMessages(
    conversationId: string,
    params?: { page?: number; limit?: number },
  ): Promise<{ messages: ChatMessage[]; meta: PaginationMeta }> {
    const { data } = await apiClient.get<PaginatedApiResponse<ChatMessage[]>>(
      `/messages/conversations/${conversationId}`,
      { params },
    );
    return { messages: data.data, meta: data.meta };
  },

  /** Send a message via REST (fallback for when socket is offline). */
  async sendMessage(
    conversationId: string,
    content: string,
  ): Promise<ChatMessage> {
    const { data } = await apiClient.post<ApiResponse<ChatMessage>>(
      `/messages/conversations/${conversationId}`,
      { content },
    );
    return data.data;
  },

  /** Mark a conversation as read. */
  async markAsRead(conversationId: string): Promise<void> {
    await apiClient.put(`/messages/conversations/${conversationId}/read`);
  },

  /** Get total unread message count across all conversations. */
  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<ApiResponse<{ count: number }>>(
      '/messages/unread-count',
    );
    return data.data.count;
  },
};
