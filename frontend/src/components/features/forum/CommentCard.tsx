'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VoteButtons } from './VoteButtons';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Reply, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import type { Comment } from '@/types/api/forum.types';

interface CommentCardProps {
  comment: Comment;
  postId: string;
  onReply: (commentId: string) => void;
  isNested?: boolean;
}

export function CommentCard({ comment, postId, onReply, isNested = false }: CommentCardProps) {
  const { user, isAuthenticated } = useAuth();
  const isAuthor = user?.id === comment.authorId;

  return (
    <div className={`flex gap-3 ${isNested ? 'mt-3 ml-12' : ''}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.author.avatar} />
        <AvatarFallback>{comment.author.fullName[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{comment.author.fullName}</span>
              {isAuthor && <Badge variant="outline">Tác giả</Badge>}
              {comment.isAccepted && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Câu trả lời đúng
                </Badge>
              )}
              <span className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{comment.content}</p>
        </div>

        <div className="flex items-center gap-3">
          <VoteButtons
            commentId={comment.id}
            score={comment.voteScore}
            userVote={comment.userVote}
            className="flex-row gap-2 space-y-0"
          />

          {isAuthenticated && !isNested && (
            <Button variant="ghost" size="sm" onClick={() => onReply(comment.id)} className="h-8">
              <Reply className="mr-1 h-4 w-4" />
              Trả lời
            </Button>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                postId={postId}
                onReply={onReply}
                isNested
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
