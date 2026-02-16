import { create } from 'zustand';
import type { AiChatMessage } from '@/types';

interface AiChatState {
  /** Current session ID (null = no active session). */
  sessionId: string | null;
  /** Messages in the current conversation. */
  messages: AiChatMessage[];
  /** Whether a message is currently being processed by the AI. */
  isLoading: boolean;
  /** Whether tokens are currently streaming in. */
  isStreaming: boolean;
  /** Suggestion buttons returned by the last AI response. */
  suggestions: string[];

  /** Set the active session and its messages. */
  setSession: (sessionId: string, messages: AiChatMessage[]) => void;
  /** Add a user message to the conversation. */
  addUserMessage: (content: string) => void;
  /** Add the AI response to the conversation. */
  addAssistantMessage: (content: string, sessionId: string, suggestions?: string[]) => void;
  /** Start an empty assistant message for streaming. */
  startAssistantStream: () => void;
  /** Append a token to the last assistant message (streaming). */
  appendToStream: (token: string) => void;
  /** Finalize the stream with sessionId and suggestions. */
  finalizeStream: (sessionId: string, suggestions: string[]) => void;
  /** Set loading state. */
  setLoading: (loading: boolean) => void;
  /** Clear the current session and start fresh. */
  clearSession: () => void;
}

/** Zustand store for managing the active AI chat session in-memory (no persistence). */
export const useAiChatStore = create<AiChatState>()((set) => ({
  sessionId: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  suggestions: [],

  setSession: (sessionId, messages) => set({ sessionId, messages, suggestions: [] }),

  addUserMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { role: 'user' as const, content, timestamp: new Date().toISOString() },
      ],
      suggestions: [],
    })),

  addAssistantMessage: (content, sessionId, suggestions = []) =>
    set((state) => ({
      sessionId,
      messages: [
        ...state.messages,
        { role: 'assistant' as const, content, timestamp: new Date().toISOString() },
      ],
      suggestions,
      isLoading: false,
      isStreaming: false,
    })),

  startAssistantStream: () =>
    set((state) => ({
      messages: [
        ...state.messages,
        { role: 'assistant' as const, content: '', timestamp: new Date().toISOString() },
      ],
      isStreaming: true,
      isLoading: false,
    })),

  appendToStream: (token) =>
    set((state) => {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + token };
      }
      return { messages: msgs };
    }),

  finalizeStream: (sessionId, suggestions) =>
    set({ sessionId, suggestions, isStreaming: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  clearSession: () =>
    set({ sessionId: null, messages: [], isLoading: false, isStreaming: false, suggestions: [] }),
}));
