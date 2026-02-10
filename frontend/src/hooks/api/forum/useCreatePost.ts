import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/lib/i18n/routing';
import { forumApi } from '@/lib/api/forum.api';
import type { CreatePostInput } from '@/types/api/forum.types';
import { toast } from 'sonner';

export function useCreatePost() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreatePostInput) => forumApi.createPost(data),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Tạo bài viết thành công!');
      router.push(`/forum/${post.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể tạo bài viết');
    },
  });
}
