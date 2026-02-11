import { useQuery } from '@tanstack/react-query';
import { searchJobs } from '@/lib/api/career.api';
import type { JobFilters } from '@/types/api/career.types';

export function useSearchJobs(query: string, filters: JobFilters) {
  return useQuery({
    queryKey: ['jobs', 'search', query, filters],
    queryFn: () => searchJobs(query, filters),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}
