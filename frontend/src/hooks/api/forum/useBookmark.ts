import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forumApi } from '@/lib/api/forum.api';
import { toast } from 'sonner';

export function useBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isBookmarked }: { postId: string; isBookmarked: boolean }) => {
      if (isBookmarked) {
        await forumApi.unbookmarkPost(postId);
      } else {
        await forumApi.bookmarkPost(postId);
      }
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể bookmark');
    },
  });
}
