'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChatHub } from '@/hooks/realtime/useChatHub';
import { useUploadChatFile } from '@/hooks/api/chat/useUploadChatFile';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const chatHub = useChatHub();
  const uploadFileMutation = useUploadChatFile();

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      chatHub.sendTypingIndicator(conversationId, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      chatHub.sendTypingIndicator(conversationId, false);
    }, 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước file tối đa 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSend = async () => {
    if (!content.trim() && !selectedFile) return;

    try {
      if (selectedFile) {
        // Upload file first
        const uploadResult = await uploadFileMutation.mutateAsync({
          conversationId,
          file: selectedFile,
        });

        // Send message with file
        await chatHub.sendMessage(
          conversationId,
          content.trim() || selectedFile.name,
          'File'
        );
      } else {
        // Send text message
        await chatHub.sendMessage(conversationId, content.trim(), 'Text');
      }

      setContent('');
      setSelectedFile(null);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      chatHub.sendTypingIndicator(conversationId, false);
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Không thể gửi tin nhắn');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2">
      {selectedFile && (
        <div className="flex items-center justify-between rounded-lg border p-2">
          <div className="flex items-center space-x-2">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{selectedFile.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFile(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-end space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Textarea
          placeholder="Nhập tin nhắn..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          rows={1}
          className="min-h-10 max-h-32 resize-none"
        />

        <Button
          onClick={handleSend}
          disabled={(!content.trim() && !selectedFile) || uploadFileMutation.isPending}
          size="icon"
        >
          {uploadFileMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
