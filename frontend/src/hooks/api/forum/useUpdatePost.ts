import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forumApi } from '@/lib/api/forum.api';
import type { UpdatePostInput } from '@/types/api/forum.types';
import { toast } from 'sonner';

export function useUpdatePost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePostInput) => forumApi.updatePost(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Cập nhật bài viết thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể cập nhật bài viết');
    },
  });
}
