import { useMutation } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chat.api';
import { toast } from 'sonner';

export function useUploadChatFile() {
  return useMutation({
    mutationFn: ({ conversationId, file }: { conversationId: string; file: File }) =>
      chatApi.uploadFile(conversationId, file),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể tải file lên');
    },
  });
}
