import { create } from 'zustand';

/** Generate a stable UUID v4 for new conversations (modern chat apps pattern) */
export function generateConversationId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
  type?: 'text' | 'image' | 'video' | 'audio' | '3d';
  mediaUrl?: string;
}

interface ChatState {
  messages: Message[];
  conversationId: string | null;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setConversationId: (id: string | null) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  conversationId: null,

  setMessages: (messages) =>
    set((state) => ({
      messages: typeof messages === 'function' ? messages(state.messages) : messages,
    })),

  setConversationId: (id) => set({ conversationId: id }),

  resetChat: () => set({ messages: [], conversationId: null }),
}));
