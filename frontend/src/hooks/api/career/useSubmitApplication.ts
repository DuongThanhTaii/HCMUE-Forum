import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitApplication } from '@/lib/api/career.api';
import { toast } from 'sonner';
import type { CreateApplicationDto } from '@/types/api/career.types';

export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationData: CreateApplicationDto) => submitApplication(applicationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Nộp đơn ứng tuyển thành công!');
    },
    onError: () => {
      toast.error('Không thể nộp đơn ứng tuyển');
    },
  });
}
