import { useQuery } from '@tanstack/react-query';
import { getCompanyJobs } from '@/lib/api/career.api';

export function useCompanyJobs(id: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['company', id, 'jobs', page],
    queryFn: () => getCompanyJobs(id, page, pageSize),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
