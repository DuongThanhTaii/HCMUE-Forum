import { useQuery } from '@tanstack/react-query';
import { getCompany } from '@/lib/api/career.api';

export function useCompany(id: string) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompany(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
