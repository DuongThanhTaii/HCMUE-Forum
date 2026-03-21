import { useQuery } from '@tanstack/react-query';
import { learningApi } from '@/lib/api/learning.api';
import type { CoursesQueryParams } from '@/types/api/learning.types';

export function useCourses(params: CoursesQueryParams = {}) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => learningApi.getCourses(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
