'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { useMessages } from '@/hooks/api/chat/useMessages';
import { useChatHub } from '@/hooks/realtime/useChatHub';
import { useAuthStore } from '@/stores/auth.store';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const chatHub = useChatHub();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [page, setPage] = useState(1);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messages = useChatStore((state) => state.messages[conversationId] || []);
  const clearUnread = useChatStore((state) => state.clearUnread);

  const { data, isLoading, isError } = useMessages(conversationId, page);

  useEffect(() => {
    // Join conversation
    chatHub.joinConversation(conversationId).then(() => {
      setIsJoined(true);
      clearUnread(conversationId);
    });

    return () => {
      chatHub.leaveConversation(conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (messages.length > 0) {
      const isAtBottom =
        scrollRef.current &&
        scrollRef.current.scrollHeight - scrollRef.current.scrollTop <=
          scrollRef.current.clientHeight + 100;

      if (isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);

      // Load more messages when scrolling to top
      if (scrollTop === 0 && data && data.page < data.totalPages) {
        setPage((prev) => prev + 1);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isJoined || isLoading) {
    return (
      <div className="flex h-full flex-col space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-destructive">
        Không thể tải tin nhắn
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 px-4"
      >
        <div className="space-y-4 py-4">
          {data && page < data.totalPages && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
              >
                <Loader2 className="mr-2 h-4 w-4" />
                Tải thêm tin nhắn
              </Button>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === userId}
            />
          ))}
          
          <TypingIndicator conversationId={conversationId} />
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {showScrollButton && (
        <div className="absolute bottom-24 right-8">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToBottom}
            className="rounded-full shadow-lg"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="border-t p-4">
        <MessageInput conversationId={conversationId} />
      </div>
    </div>
  );
}
