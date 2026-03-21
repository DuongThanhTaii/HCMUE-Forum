import { useMutation, useQueryClient } from '@tanstack/react-query';
import { learningApi } from '@/lib/api/learning.api';
import type { RateDocumentInput } from '@/types/api/learning.types';
import { toast } from 'sonner';

export function useRateDocument(documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RateDocumentInput) => learningApi.rateDocument(documentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Đánh giá thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể đánh giá tài liệu');
    },
  });
}
