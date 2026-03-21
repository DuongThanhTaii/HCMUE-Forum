import { useQuery } from '@tanstack/react-query';
import { forumApi } from '@/lib/api/forum.api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => forumApi.getCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
