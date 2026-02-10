import { useQuery } from '@tanstack/react-query';
import { forumApi } from '@/lib/api/forum.api';

export function useComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => forumApi.getComments(postId),
    enabled: !!postId,
    staleTime: 1000 * 30, // 30 seconds
  });
}
