'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useChatHub } from '@/hooks/realtime/useChatHub';
import { useAuthStore } from '@/stores/auth.store';
import type { Message } from '@/types/api/chat.types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

const COMMON_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const chatHub = useChatHub();
  const userId = useAuthStore((state) => state.user?.id);

  const handleReaction = (emoji: string) => {
    const existingReaction = message.reactions.find((r) => r.emoji === emoji);
    if (existingReaction?.userIds.includes(userId!)) {
      chatHub.removeReaction(message.id, emoji);
    } else {
      chatHub.addReaction(message.id, emoji);
    }
  };

  return (
    <div className={cn('flex gap-2 group', isOwnMessage && 'flex-row-reverse')}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender.avatar} />
          <AvatarFallback>
            {message.sender.fullName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col max-w-[70%]', isOwnMessage && 'items-end')}>
        {!isOwnMessage && (
          <span className="text-xs font-medium mb-1 px-3">
            {message.sender.fullName}
          </span>
        )}

        {message.replyTo && (
          <div className="rounded-lg bg-muted/50 p-2 text-xs mb-1 border-l-2 border-primary">
            <span className="font-medium">{message.replyTo.senderName}</span>
            <p className="text-muted-foreground line-clamp-1">{message.replyTo.content}</p>
          </div>
        )}

        <div
          className={cn(
            'rounded-lg px-4 py-2',
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          {message.messageType === 'File' ? (
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {message.fileName || 'File đính kèm'}
              </a>
              {message.fileSize && (
                <span className="text-xs opacity-70">
                  ({(message.fileSize / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 px-3">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
            {message.editedAt && ' (đã chỉnh sửa)'}
          </span>

          {message.reactions.length > 0 && (
            <div className="flex gap-1">
              {message.reactions.map((reaction, i) => (
                <button
                  key={i}
                  onClick={() => handleReaction(reaction.emoji)}
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full bg-background border',
                    reaction.userIds.includes(userId!) && 'border-primary'
                  )}
                >
                  {reaction.emoji} {reaction.userIds.length}
                </button>
              ))}
            </div>
          )}

          <div className="hidden group-hover:flex gap-1 ml-auto">
            {COMMON_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-sm hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
