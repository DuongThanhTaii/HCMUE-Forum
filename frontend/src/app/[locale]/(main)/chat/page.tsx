'use client';

import { useState, useEffect } from 'react';
import { ConversationList } from '@/components/features/chat/ConversationList';
import { ChatWindow } from '@/components/features/chat/ChatWindow';
import { useConversations } from '@/hooks/api/chat/useConversations';
import { useChatHub } from '@/hooks/realtime/useChatHub';
import { useChatStore } from '@/stores/chat.store';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  useChatHub(); // Initialize SignalR connection
  const { isLoading, isError } = useConversations();
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
  };

  useEffect(() => {
    // Clear active conversation on unmount
    return () => setActiveConversation(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-destructive">
        Không thể tải danh sách cuộc trò chuyện
      </div>
    );
  }

  return (
    <div className="container mx-auto h-[calc(100vh-4rem)]">
      <div className="grid h-full grid-cols-1 md:grid-cols-[350px_1fr] gap-0 border rounded-lg overflow-hidden">
        <div className="border-r bg-background">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Tin nhắn</h2>
          </div>
          <ConversationList onSelectConversation={handleSelectConversation} />
        </div>

        <div className="bg-background">
          {activeConversationId ? (
            <ChatWindow conversationId={activeConversationId} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Chào mừng đến với Chat</p>
                <p className="text-sm">Chọn một cuộc trò chuyện để bắt đầu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
