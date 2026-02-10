import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forumApi } from '@/lib/api/forum.api';
import type { CreateCommentInput } from '@/types/api/forum.types';
import { toast } from 'sonner';

export function useCreateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentInput) => forumApi.createComment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      toast.success('Thêm bình luận thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể thêm bình luận');
    },
  });
}
