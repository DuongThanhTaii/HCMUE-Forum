import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publishJob } from '@/lib/api/career.api';
import { toast } from 'sonner';

export function usePublishJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishJob(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Đã đăng tin tuyển dụng!');
    },
    onError: () => {
      toast.error('Không thể đăng tin tuyển dụng');
    },
  });
}
