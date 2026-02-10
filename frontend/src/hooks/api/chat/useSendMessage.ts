import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chat.api';
import { toast } from 'sonner';
import type { SendMessageInput } from '@/types/api/chat.types';

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageInput) => chatApi.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể gửi tin nhắn');
    },
  });
}
