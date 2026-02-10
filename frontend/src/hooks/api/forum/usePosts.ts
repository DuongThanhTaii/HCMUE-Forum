import { useQuery } from '@tanstack/react-query';
import { forumApi } from '@/lib/api/forum.api';
import type { PostsQueryParams } from '@/types/api/forum.types';

export function usePosts(params: PostsQueryParams = {}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => forumApi.getPosts(params),
    staleTime: 1000 * 60, // 1 minute
  });
}
