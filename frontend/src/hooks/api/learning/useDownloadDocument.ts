import { useMutation, useQueryClient } from '@tanstack/react-query';
import { learningApi } from '@/lib/api/learning.api';
import { toast } from 'sonner';

export function useDownloadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => learningApi.downloadDocument(documentId),
    onSuccess: (_, documentId) => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể tải xuống tài liệu');
    },
  });
}
