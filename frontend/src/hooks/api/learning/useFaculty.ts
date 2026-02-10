import { useQuery } from '@tanstack/react-query';
import { learningApi } from '@/lib/api/learning.api';

export function useFaculty(id: string) {
  return useQuery({
    queryKey: ['faculty', id],
    queryFn: () => learningApi.getFaculty(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
