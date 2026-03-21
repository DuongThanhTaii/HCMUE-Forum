'use client';

import { useState } from 'react';
import { useVote } from '@/hooks/api/forum/useVote';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { VoteType } from '@/types/api/forum.types';

interface VoteButtonsProps {
  postId?: string;
  commentId?: string;
  score: number;
  userVote?: VoteType | null;
  className?: string;
}

export function VoteButtons({
  postId,
  commentId,
  score: initialScore,
  userVote,
  className,
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [vote, setVote] = useState<VoteType | null>(userVote || null);
  const { mutate: submitVote } = useVote();

  const handleVote = (voteType: VoteType) => {
    // If clicking same vote, remove it
    const newVote = vote === voteType ? null : voteType;

    // Calculate score diff
    let scoreDiff = 0;
    if (vote === 'Upvote') scoreDiff -= 1;
    if (vote === 'Downvote') scoreDiff += 1;
    if (newVote === 'Upvote') scoreDiff += 1;
    if (newVote === 'Downvote') scoreDiff -= 1;

    // Optimistic update
    setScore(score + scoreDiff);
    setVote(newVote);

    // Submit to server
    submitVote(
      { postId, commentId, voteType: newVote || voteType },
      {
        onError: () => {
          // Rollback on error
          setScore(initialScore);
          setVote(userVote || null);
        },
      }
    );
  };

  return (
    <div className={cn('flex flex-col items-center space-y-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('Upvote')}
        className={cn(
          'h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-950',
          vote === 'Upvote' && 'bg-orange-100 text-orange-500 dark:bg-orange-950'
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="h-5 w-5" />
      </Button>
      <span
        className={cn('text-sm font-medium tabular-nums', {
          'text-orange-500': score > 0,
          'text-blue-500': score < 0,
          'text-muted-foreground': score === 0,
        })}
      >
        {score}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('Downvote')}
        className={cn(
          'h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-950',
          vote === 'Downvote' && 'bg-blue-100 text-blue-500 dark:bg-blue-950'
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  );
}
