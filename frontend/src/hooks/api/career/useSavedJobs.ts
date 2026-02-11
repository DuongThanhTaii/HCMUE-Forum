import { useQuery } from '@tanstack/react-query';
import { getSavedJobs } from '@/lib/api/career.api';

export function useSavedJobs(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['jobs', 'saved', page],
    queryFn: () => getSavedJobs(page, pageSize),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
