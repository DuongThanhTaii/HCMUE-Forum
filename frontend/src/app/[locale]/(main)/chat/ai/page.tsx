'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAIConversations } from '@/hooks/api/chat/useAIConversations';
import { useAIConversation } from '@/hooks/api/chat/useAIConversation';
import { useSendAIMessage } from '@/hooks/api/chat/useSendAIMessage';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils/cn';

export default function AIBotPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = useAIConversations();
  const { data: conversationData } = useAIConversation(selectedConversationId || '');
  const sendMessageMutation = useSendAIMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationData?.messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const messageContent = input.trim();
    setInput('');

    await sendMessageMutation.mutateAsync({
      conversationId: selectedConversationId || undefined,
      content: messageContent,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Sidebar - Conversation List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-5 w-5" />
              UniBot AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full mb-4"
              onClick={() => setSelectedConversationId(null)}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Cuộc trò chuyện mới
            </Button>

            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-2">
                {conversations?.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={cn(
                      'w-full text-left rounded-lg p-3 transition-colors hover:bg-accent',
                      selectedConversationId === conv.id && 'bg-accent'
                    )}
                  >
                    <p className="font-medium truncate">
                      {conv.title || 'Cuộc trò chuyện mới'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conv.messageCount} tin nhắn
                    </p>
                  </button>
                ))}

                {conversations?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Chưa có cuộc trò chuyện nào
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">UniBot AI Assistant</p>
                  <p className="text-xs text-muted-foreground">
                    Trợ lý AI thông minh của bạn
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-[calc(100vh-14rem)]">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                {!selectedConversationId && !conversationData && (
                  <div className="text-center py-12">
                    <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      Xin chào! Tôi là UniBot AI
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Tôi có thể giúp bạn trả lời câu hỏi, tìm kiếm thông tin, và hỗ trợ
                      các tác vụ học tập. Hãy hỏi tôi bất cứ điều gì!
                    </p>
                  </div>
                )}

                {conversationData?.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' && 'flex-row-reverse'
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {message.role === 'assistant' ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          'U'
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={cn(
                        'flex flex-col max-w-[80%]',
                        message.role === 'user' && 'items-end'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-lg px-4 py-2',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                        {message.toolCalls && message.toolCalls.length > 0 && (
                          <div className="mt-2 space-y-1 text-xs opacity-70">
                            {message.toolCalls.map((tool) => (
                              <div key={tool.id} className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                <span>Calling: {tool.function.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="text-xs text-muted-foreground mt-1 px-2">
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {sendMessageMutation.isPending && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex items-end gap-2 pt-4 border-t">
              <Textarea
                placeholder="Hỏi UniBot..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                className="min-h-10 max-h-32 resize-none"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sendMessageMutation.isPending}
                size="icon"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
