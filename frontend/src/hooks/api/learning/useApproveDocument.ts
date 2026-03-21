import { useMutation, useQueryClient } from '@tanstack/react-query';
import { learningApi } from '@/lib/api/learning.api';
import { toast } from 'sonner';

export function useApproveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => learningApi.approveDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Đã duyệt tài liệu thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể duyệt tài liệu');
    },
  });
}
