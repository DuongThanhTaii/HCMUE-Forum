import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chat.api';
import { toast } from 'sonner';
import type { SendAIMessageInput } from '@/types/api/chat.types';

export function useSendAIMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendAIMessageInput) => chatApi.sendAIMessage(data),
    onSuccess: (response, variables) => {
      if (variables.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['ai', 'conversation', variables.conversationId] });
      }
      queryClient.invalidateQueries({ queryKey: ['ai', 'conversations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể gửi tin nhắn đến AI');
    },
  });
}
