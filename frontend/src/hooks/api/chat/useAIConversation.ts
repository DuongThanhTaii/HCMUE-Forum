import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chat.api';

export function useAIConversation(conversationId: string) {
  return useQuery({
    queryKey: ['ai', 'conversation', conversationId],
    queryFn: async () => {
      const response = await chatApi.getAIConversation(conversationId);
      return response.data;
    },
    enabled: !!conversationId,
  });
}
