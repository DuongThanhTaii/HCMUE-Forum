import { useMutation, useQueryClient } from '@tanstack/react-query';
import { withdrawApplication } from '@/lib/api/career.api';
import { toast } from 'sonner';

export function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => withdrawApplication(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Đã rút đơn ứng tuyển');
    },
    onError: () => {
      toast.error('Không thể rút đơn');
    },
  });
}
