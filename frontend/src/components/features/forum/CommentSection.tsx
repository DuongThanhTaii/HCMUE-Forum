'use client';

import { useState } from 'react';
import { useComments } from '@/hooks/api/forum/useComments';
import { useCreateComment } from '@/hooks/api/forum/useCreateComment';
import { useAuth } from '@/hooks/auth/useAuth';
import { CommentCard } from './CommentCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: comments, isLoading } = useComments(postId);
  const { mutate: createComment, isPending } = useCreateComment(postId);
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length < 10) return;

    createComment(
      {
        content,
        postId,
        parentId: replyingTo,
      },
      {
        onSuccess: () => {
          setContent('');
          setReplyingTo(null);
        },
      }
    );
  };

  const topLevelComments = comments?.filter((comment) => !comment.parentId) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h2 className="text-xl font-semibold">
          Bình luận ({comments?.length || 0})
        </h2>
      </div>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder="Viết bình luận của bạn... (tối thiểu 10 ký tự)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
            disabled={isPending}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {content.length} / 5000 ký tự
            </span>
            <div className="flex gap-2">
              {replyingTo && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setContent('');
                  }}
                >
                  Hủy trả lời
                </Button>
              )}
              <Button type="submit" disabled={isPending || content.length < 10}>
                {isPending ? 'Đang gửi...' : 'Gửi bình luận'}
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))
        ) : topLevelComments.length === 0 ? (
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </div>
        ) : (
          topLevelComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              postId={postId}
              onReply={(commentId) => {
                setReplyingTo(commentId);
                document.querySelector('textarea')?.focus();
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
