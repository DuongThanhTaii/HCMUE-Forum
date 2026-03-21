import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chat.api';
import { useChatStore } from '@/stores/chat.store';

export function useMessages(conversationId: string, page: number = 1) {
  const setMessages = useChatStore((state) => state.setMessages);
  const prependMessages = useChatStore((state) => state.prependMessages);

  return useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: async () => {
      const response = await chatApi.getMessages({ conversationId, page, pageSize: 50 });
      if (page === 1) {
        setMessages(conversationId, response.data.items);
      } else {
        prependMessages(conversationId, response.data.items);
      }
      return response.data;
    },
    enabled: !!conversationId,
    staleTime: 60000, // 1 minute
  });
}
