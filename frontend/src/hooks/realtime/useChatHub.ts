'use client';

import { useEffect, useRef } from 'react';
import { getChatHub } from '@/lib/signalr/chatHub';
import { useChatStore } from '@/stores/chat.store';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

export function useChatHub() {
  const chatHubRef = useRef(getChatHub());
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);
  const user = useAuthStore((state) => state.user);
  const {
    addMessage,
    updateMessage,
    deleteMessage,
    setTyping,
    setUserOnline,
    incrementUnread,
    activeConversationId,
    addReactionToMessage,
    removeReactionFromMessage,
    markMessageAsRead,
  } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const chatHub = chatHubRef.current;

    // Start connection
    chatHub.start().catch((error) => {
      console.error('Failed to start ChatHub:', error);
      toast.error('Không thể kết nối đến máy chủ chat');
    });

    // Setup event listeners
    chatHub.onReceiveMessage((message) => {
      addMessage(message);
      if (message.conversationId !== activeConversationId && message.senderId !== user?.id) {
        incrementUnread(message.conversationId);
      }
    });

    chatHub.onMessageEdited((messageId, newContent) => {
      updateMessage(messageId, { content: newContent, editedAt: new Date().toISOString() });
    });

    chatHub.onMessageDeleted((messageId) => {
      deleteMessage(messageId);
    });

    chatHub.onUserTyping((conversationId, userId, isTyping) => {
      if (userId !== user?.id) {
        setTyping(conversationId, userId, isTyping);
      }
    });

    chatHub.onUserStatusChanged((userId, status) => {
      setUserOnline(userId, status === 'Online');
    });

    chatHub.onReactionAdded((messageId, userId, emoji) => {
      addReactionToMessage(messageId, emoji, userId);
    });

    chatHub.onReactionRemoved((messageId, userId, emoji) => {
      removeReactionFromMessage(messageId, emoji, userId);
    });

    chatHub.onMessageRead((messageId, userId) => {
      markMessageAsRead(messageId, userId);
    });

    // Cleanup on unmount
    return () => {
      chatHub.stop();
    };
  }, [isAuthenticated, user?.id, activeConversationId]);

  return chatHubRef.current;
}
