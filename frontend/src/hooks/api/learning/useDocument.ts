import { useQuery } from '@tanstack/react-query';
import { learningApi } from '@/lib/api/learning.api';

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => learningApi.getDocument(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}
