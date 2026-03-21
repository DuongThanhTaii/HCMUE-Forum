import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createJob } from '@/lib/api/career.api';
import { toast } from 'sonner';
import type { CreateJobDto } from '@/types/api/career.types';

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobData: CreateJobDto) => createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Tạo tin tuyển dụng thành công!');
    },
    onError: () => {
      toast.error('Không thể tạo tin tuyển dụng');
    },
  });
}
