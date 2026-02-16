'use server';

import { serverFetch, serverFetchPaginated, type ActionResult } from '@/lib/server-api';
import type {
  AiChatResponse,
  AiConversationSummary,
  AiChatSession,
  AiSearchResponse,
  PaginationMeta,
} from '@/types';

interface AiChatHistoryResult {
  conversations: AiConversationSummary[];
  meta: PaginationMeta;
}

/**
 * Sends a message to the AI chat assistant.
 * @param message - The user's message text.
 * @param sessionId - Optional session ID to continue a conversation.
 */
export async function sendAiMessage(
  message: string,
  sessionId?: string
): Promise<ActionResult<AiChatResponse>> {
  try {
    const data = await serverFetch<AiChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send message',
    };
  }
}

/**
 * Fetches the user's AI chat conversation history.
 * @param params - Pagination parameters.
 */
export async function getAiChatHistory(params?: {
  page?: number;
  limit?: number;
}): Promise<ActionResult<AiChatHistoryResult>> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const qs = searchParams.toString();
    const result = await serverFetchPaginated<AiConversationSummary[]>(
      `/ai/chat/history${qs ? `?${qs}` : ''}`
    );
    return { success: true, data: { conversations: result.data, meta: result.meta } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch chat history',
    };
  }
}

/**
 * Gets the full messages for a specific AI chat session.
 * @param sessionId - The session UUID to retrieve.
 */
export async function getAiChatSession(sessionId: string): Promise<ActionResult<AiChatSession>> {
  try {
    const data = await serverFetch<AiChatSession>(`/ai/chat/session/${sessionId}`);
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch chat session',
    };
  }
}

/**
 * Ends (closes) an AI chat session and clears the cached context.
 * @param sessionId - Optional session ID. If omitted, clears the active session.
 */
export async function endAiChatSession(
  sessionId?: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const path = sessionId ? `/ai/chat/session/${sessionId}` : '/ai/chat/session';
    const data = await serverFetch<{ success: boolean }>(path, { method: 'DELETE' });
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to end chat session',
    };
  }
}

/**
 * Performs a semantic AI-powered search for businesses or services.
 * @param query - The natural language search query.
 * @param type - Search type: 'business' or 'service'.
 * @param filters - Optional filters (city, category, limit).
 */
export async function aiSearch(
  query: string,
  type: 'business' | 'service' = 'business',
  filters?: { city?: string; category?: string; limit?: number }
): Promise<ActionResult<AiSearchResponse>> {
  try {
    const data = await serverFetch<AiSearchResponse>('/ai/search', {
      method: 'POST',
      body: JSON.stringify({ query, type, ...filters }),
    });
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to perform AI search',
    };
  }
}
