import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chat.api';

export function useAIConversations() {
  return useQuery({
    queryKey: ['ai', 'conversations'],
    queryFn: async () => {
      const response = await chatApi.getAIConversations();
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });
}
