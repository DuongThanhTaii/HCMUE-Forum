import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/lib/i18n/routing';
import { forumApi } from '@/lib/api/forum.api';
import { toast } from 'sonner';

export function useDeletePost() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (postId: string) => forumApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Xóa bài viết thành công!');
      router.push('/forum');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể xóa bài viết');
    },
  });
}
