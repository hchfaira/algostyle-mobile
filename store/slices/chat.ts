/**
 * Chat state slice
 */
import type { ChatMessageType } from '../../types';

export interface ChatState {
  chatSessionId: string | null;
  chatMessages: ChatMessageType[];

  setChatSession: (id: string) => void;
  addChatMessage: (msg: ChatMessageType) => void;
  clearChat: () => void;
}

export const createChatSlice = (set: any): ChatState => ({
  chatSessionId: null,
  chatMessages: [],

  setChatSession: (id) => set({ chatSessionId: id }),

  addChatMessage: (msg) =>
    set((s: any) => ({ chatMessages: [...s.chatMessages, msg] })),

  clearChat: () => set({ chatMessages: [], chatSessionId: null }),
});
