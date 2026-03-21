import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateJob } from '@/lib/api/career.api';
import { toast } from 'sonner';
import type { UpdateJobDto } from '@/types/api/career.types';

export function useUpdateJob(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobData: UpdateJobDto) => updateJob(id, jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Cập nhật tin tuyển dụng thành công!');
    },
    onError: () => {
      toast.error('Không thể cập nhật tin tuyển dụng');
    },
  });
}
