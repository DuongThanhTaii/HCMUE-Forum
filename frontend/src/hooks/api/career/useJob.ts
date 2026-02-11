import { useQuery } from '@tanstack/react-query';
import { getJob } from '@/lib/api/career.api';

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => getJob(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
