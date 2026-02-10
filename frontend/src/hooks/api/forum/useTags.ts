import { useQuery } from '@tanstack/react-query';
import { forumApi } from '@/lib/api/forum.api';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => forumApi.getTags(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function usePopularTags() {
  return useQuery({
    queryKey: ['tags', 'popular'],
    queryFn: () => forumApi.getPopularTags(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
