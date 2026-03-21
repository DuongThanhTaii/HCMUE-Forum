'use client';

import { useChatStore } from '@/stores/chat.store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationList({ onSelectConversation }: ConversationListProps) {
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);

  const getConversationName = (conversation: typeof conversations[0]) => {
    if (conversation.name) return conversation.name;
    return conversation.participants.map((p) => p.userName).join(', ');
  };

  const getConversationAvatar = (conversation: typeof conversations[0]) => {
    if (conversation.type === 'Direct') {
      const otherParticipant = conversation.participants[0];
      return otherParticipant?.avatar;
    }
    return undefined;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={cn(
              'w-full rounded-lg p-3 text-left transition-colors hover:bg-accent',
              activeConversationId === conversation.id && 'bg-accent'
            )}
          >
            <div className="flex items-start space-x-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={getConversationAvatar(conversation)} />
                  <AvatarFallback>{getInitials(getConversationName(conversation))}</AvatarFallback>
                </Avatar>
                {conversation.type === 'Direct' &&
                  conversation.participants[0]?.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium truncate">
                    {getConversationName(conversation)}
                  </span>
                  {conversation.lastMessage && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                        addSuffix: false,
                        locale: vi,
                      })}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  {conversation.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage.messageType === 'File' && '📎 '}
                      {conversation.lastMessage.content}
                    </p>
                  )}
                  {conversation.unreadCount > 0 && (
                    <Badge variant="default" className="shrink-0 ml-2">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}

        {conversations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Chưa có cuộc trò chuyện nào</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
