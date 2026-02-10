import { Link } from '@/lib/i18n/routing';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VoteButtons } from './VoteButtons';
import { Eye, MessageCircle, Bookmark, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Post } from '@/types/api/forum.types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex gap-4 p-4">
        <VoteButtons
          postId={post.id}
          score={post.voteScore}
          userVote={post.userVote}
          className="flex-shrink-0"
        />
        
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link
                href={`/forum/${post.id}`}
                className="hover:underline hover:text-primary inline"
              >
                <h3 className="text-lg font-semibold line-clamp-2">{post.title}</h3>
              </Link>
              {post.isPinned && (
                <Badge variant="secondary" className="ml-2">
                  <Pin className="mr-1 h-3 w-3" />
                  Đã ghim
                </Badge>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{post.category.name}</Badge>
            {post.tags.map((tag) => (
              <Link key={tag.id} href={`/forum/tags/${tag.slug}`}>
                <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2 flex-wrap">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{post.author.fullName[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{post.author.fullName}</span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.viewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{post.commentCount}</span>
              </div>
              {post.isBookmarked && <Bookmark className="h-4 w-4 fill-current" />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
