import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chat.api';
import { useChatStore } from '@/stores/chat.store';

export function useConversations() {
  const setConversations = useChatStore((state) => state.setConversations);

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await chatApi.getConversations();
      setConversations(response.data);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
}
