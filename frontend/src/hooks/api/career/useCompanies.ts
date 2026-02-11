import { useQuery } from '@tanstack/react-query';
import { getCompanies } from '@/lib/api/career.api';

export function useCompanies(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['companies', page],
    queryFn: () => getCompanies(page, pageSize),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
