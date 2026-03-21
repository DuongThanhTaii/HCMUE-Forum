import { useQuery } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chat.api';

export function usePublicChannels() {
  return useQuery({
    queryKey: ['channels', 'public'],
    queryFn: async () => {
      const response = await chatApi.getPublicChannels();
      return response.data;
    },
    staleTime: 300000, // 5 minutes
  });
}
