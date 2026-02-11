import { useQuery } from '@tanstack/react-query';
import { getMyApplications } from '@/lib/api/career.api';

export function useMyApplications(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['applications', page],
    queryFn: () => getMyApplications(page, pageSize),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
