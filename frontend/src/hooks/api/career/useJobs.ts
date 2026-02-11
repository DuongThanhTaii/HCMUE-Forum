import { useQuery } from '@tanstack/react-query';
import { getJobs } from '@/lib/api/career.api';
import type { JobFilters } from '@/types/api/career.types';

export function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => getJobs(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
