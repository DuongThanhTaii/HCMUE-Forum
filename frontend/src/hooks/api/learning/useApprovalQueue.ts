import { useQuery } from '@tanstack/react-query';
import { learningApi } from '@/lib/api/learning.api';

export function useApprovalQueue() {
  return useQuery({
    queryKey: ['documents', 'approval-queue'],
    queryFn: () => learningApi.getApprovalQueue(),
    staleTime: 1000 * 30, // 30 seconds
  });
}
