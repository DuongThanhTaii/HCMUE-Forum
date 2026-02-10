import { useQuery } from '@tanstack/react-query';
import { learningApi } from '@/lib/api/learning.api';

export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => learningApi.getCourse(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
