import { useMutation, useQueryClient } from '@tanstack/react-query';
import { closeJob } from '@/lib/api/career.api';
import { toast } from 'sonner';

export function useCloseJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => closeJob(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Đã đóng tin tuyển dụng!');
    },
    onError: () => {
      toast.error('Không thể đóng tin tuyển dụng');
    },
  });
}
