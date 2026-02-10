import { create } from 'zustand';
import type { Conversation, Message } from '@/types/api/chat.types';

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId → messages[]
  activeConversationId: string | null;
  typingUsers: Record<string, string[]>; // conversationId → userIds[]
  onlineUsers: string[];

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  prependMessages: (conversationId: string, messages: Message[]) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (messageId: string) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
  incrementUnread: (conversationId: string) => void;
  clearUnread: (conversationId: string) => void;
  addReactionToMessage: (messageId: string, emoji: string, userId: string) => void;
  removeReactionFromMessage: (messageId: string, emoji: string, userId: string) => void;
  markMessageAsRead: (messageId: string, userId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversationId: null,
  typingUsers: {},
  onlineUsers: [],

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (conversationId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, ...updates } : conv
      ),
    })),

  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  addMessage: (message) =>
    set((state) => {
      const conversationMessages = state.messages[message.conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [message.conversationId]: [...conversationMessages, message],
        },
        conversations: state.conversations.map((conv) =>
          conv.id === message.conversationId
            ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
            : conv
        ),
      };
    }),

  prependMessages: (conversationId, messages) =>
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...messages, ...existingMessages],
        },
      };
    }),

  updateMessage: (messageId, updates) =>
    set((state) => {
      const newMessages = { ...state.messages };
      for (const convId in newMessages) {
        newMessages[convId] = newMessages[convId].map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        );
      }
      return { messages: newMessages };
    }),

  deleteMessage: (messageId) =>
    set((state) => {
      const newMessages = { ...state.messages };
      for (const convId in newMessages) {
        newMessages[convId] = newMessages[convId].filter((msg) => msg.id !== messageId);
      }
      return { messages: newMessages };
    }),

  setTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const currentTyping = state.typingUsers[conversationId] || [];
      const newTyping = isTyping
        ? [...new Set([...currentTyping, userId])]
        : currentTyping.filter((id) => id !== userId);

      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: newTyping,
        },
      };
    }),

  setUserOnline: (userId, isOnline) =>
    set((state) => ({
      onlineUsers: isOnline
        ? [...new Set([...state.onlineUsers, userId])]
        : state.onlineUsers.filter((id) => id !== userId),
      conversations: state.conversations.map((conv) => ({
        ...conv,
        participants: conv.participants.map((p) =>
          p.userId === userId ? { ...p, isOnline } : p
        ),
      })),
    })),

  incrementUnread: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: conv.unreadCount + 1 } : conv
      ),
    })),

  clearUnread: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
    })),

  addReactionToMessage: (messageId, emoji, userId) =>
    set((state) => {
      const newMessages = { ...state.messages };
      for (const convId in newMessages) {
        newMessages[convId] = newMessages[convId].map((msg) => {
          if (msg.id === messageId) {
            const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
            if (existingReaction) {
              return {
                ...msg,
                reactions: msg.reactions.map((r) =>
                  r.emoji === emoji
                    ? { ...r, userIds: [...new Set([...r.userIds, userId])] }
                    : r
                ),
              };
            } else {
              return {
                ...msg,
                reactions: [...msg.reactions, { emoji, userIds: [userId] }],
              };
            }
          }
          return msg;
        });
      }
      return { messages: newMessages };
    }),

  removeReactionFromMessage: (messageId, emoji, userId) =>
    set((state) => {
      const newMessages = { ...state.messages };
      for (const convId in newMessages) {
        newMessages[convId] = newMessages[convId].map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              reactions: msg.reactions
                .map((r) =>
                  r.emoji === emoji
                    ? { ...r, userIds: r.userIds.filter((id) => id !== userId) }
                    : r
                )
                .filter((r) => r.userIds.length > 0),
            };
          }
          return msg;
        });
      }
      return { messages: newMessages };
    }),

  markMessageAsRead: (messageId, userId) =>
    set((state) => {
      const newMessages = { ...state.messages };
      for (const convId in newMessages) {
        newMessages[convId] = newMessages[convId].map((msg) =>
          msg.id === messageId
            ? { ...msg, readBy: [...new Set([...msg.readBy, userId])] }
            : msg
        );
      }
      return { messages: newMessages };
    }),
}));
