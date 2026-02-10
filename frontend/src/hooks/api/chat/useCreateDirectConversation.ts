import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chat.api';
import { useChatStore } from '@/stores/chat.store';
import { toast } from 'sonner';
import type { CreateDirectConversationInput } from '@/types/api/chat.types';

export function useCreateDirectConversation() {
  const queryClient = useQueryClient();
  const addConversation = useChatStore((state) => state.addConversation);

  return useMutation({
    mutationFn: (data: CreateDirectConversationInput) => chatApi.createDirectConversation(data),
    onSuccess: (response) => {
      addConversation(response.data);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Đã tạo cuộc trò chuyện');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể tạo cuộc trò chuyện');
    },
  });
}
