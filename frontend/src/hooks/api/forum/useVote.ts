import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forumApi } from '@/lib/api/forum.api';
import type { VoteType } from '@/types/api/forum.types';
import { toast } from 'sonner';

interface VoteParams {
  postId?: string;
  commentId?: string;
  voteType: VoteType;
}

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, commentId, voteType }: VoteParams) => {
      if (postId) {
        await forumApi.votePost(postId, voteType);
      } else if (commentId) {
        await forumApi.voteComment(commentId, voteType);
      }
    },
    onSuccess: (_, { postId, commentId }) => {
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ['post', postId] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
      if (commentId) {
        queryClient.invalidateQueries({ queryKey: ['comments'] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể vote');
    },
  });
}
