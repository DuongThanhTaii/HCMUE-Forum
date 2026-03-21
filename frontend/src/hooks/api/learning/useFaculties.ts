import { useQuery } from '@tanstack/react-query';
import { learningApi } from '@/lib/api/learning.api';

export function useFaculties() {
  return useQuery({
    queryKey: ['faculties'],
    queryFn: () => learningApi.getFaculties(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
