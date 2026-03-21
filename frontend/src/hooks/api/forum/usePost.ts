import { useQuery } from '@tanstack/react-query';
import { forumApi } from '@/lib/api/forum.api';

export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => forumApi.getPost(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}
