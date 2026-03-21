import { useMutation, useQueryClient } from '@tanstack/react-query';
import { learningApi } from '@/lib/api/learning.api';
import { toast } from 'sonner';

export function useRejectDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, reason }: { documentId: string; reason?: string }) =>
      learningApi.rejectDocument(documentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Đã từ chối tài liệu!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể từ chối tài liệu');
    },
  });
}
