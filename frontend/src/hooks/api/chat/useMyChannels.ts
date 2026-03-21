import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chat.api';

export function useMyChannels() {
  return useQuery({
    queryKey: ['channels', 'my'],
    queryFn: async () => {
      const response = await chatApi.getMyChannels();
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });
}
