import { useMutation, useQueryClient } from '@tanstack/react-query';
import { learningApi } from '@/lib/api/learning.api';
import type { UploadDocumentInput } from '@/types/api/learning.types';
import { toast } from 'sonner';

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadDocumentInput) => learningApi.uploadDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Tải lên thành công! Đang chờ duyệt.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể tải lên tài liệu');
    },
  });
}
