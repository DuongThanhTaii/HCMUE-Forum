import { useQuery } from '@tanstack/react-query';
import { learningApi } from '@/lib/api/learning.api';
import type { DocumentsQueryParams } from '@/types/api/learning.types';

export function useDocuments(params: DocumentsQueryParams = {}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => learningApi.getDocuments(params),
    staleTime: 1000 * 60, // 1 minute
  });
}
