'use client';

import { useChatStore } from '@/stores/chat.store';

interface TypingIndicatorProps {
  conversationId: string;
}

export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
  const typingUserIds = useChatStore((state) => state.typingUsers[conversationId] || []);
  const conversations = useChatStore((state) => state.conversations);

  if (typingUserIds.length === 0) return null;

  const conversation = conversations.find((c) => c.id === conversationId);
  const typingUsers = conversation?.participants
    .filter((p) => typingUserIds.includes(p.userId))
    .map((p) => p.userName) || [];

  if (typingUsers.length === 0) return null;

  const displayText =
    typingUsers.length === 1
      ? `${typingUsers[0]} đang nhập...`
      : typingUsers.length === 2
      ? `${typingUsers[0]} và ${typingUsers[1]} đang nhập...`
      : `${typingUsers[0]} và ${typingUsers.length - 1} người khác đang nhập...`;

  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground px-4 py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
      </div>
      <span>{displayText}</span>
    </div>
  );
}
