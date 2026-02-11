import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveJob, unsaveJob } from '@/lib/api/career.api';
import { toast } from 'sonner';

export function useSaveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, save }: { jobId: string; save: boolean }) =>
      save ? saveJob(jobId) : unsaveJob(jobId),
    onSuccess: (_data, { save }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs', 'saved'] });
      toast.success(save ? 'Đã lưu tin tuyển dụng' : 'Đã bỏ lưu tin tuyển dụng');
    },
    onError: () => {
      toast.error('Không thể thực hiện thao tác');
    },
  });
}
