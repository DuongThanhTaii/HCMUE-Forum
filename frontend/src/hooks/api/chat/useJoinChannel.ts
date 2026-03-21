import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/lib/api/chat.api';
import { toast } from 'sonner';

export function useJoinChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => chatApi.joinChannel(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast.success('Đã tham gia kênh');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể tham gia kênh');
    },
  });
}
