'use client';

import { use } from 'react';
import { usePost } from '@/hooks/api/forum/usePost';
import { useDeletePost } from '@/hooks/api/forum/useDeletePost';
import { useBookmark } from '@/hooks/api/forum/useBookmark';
import { useAuth } from '@/hooks/auth/useAuth';
import { CommentSection } from '@/components/features/forum/CommentSection';
import { VoteButtons } from '@/components/features/forum/VoteButtons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Breadcrumbs } from '@/components/shared/layouts/Breadcrumbs';
import { Link } from '@/lib/i18n/routing';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Eye,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Pin,
  AlertCircle,
} from 'lucide-react';

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = use(params);
  const { data: post, isLoading, error } = usePost(id);
  const { mutate: deletePost } = useDeletePost();
  const { mutate: toggleBookmark } = useBookmark();
  const { user, isAuthenticated } = useAuth();

  const isAuthor = user?.id === post?.authorId;
  const canEdit = isAuthor;
  const canDelete = isAuthor || user?.roles.includes('Moderator') || user?.roles.includes('Admin');

  const handleBookmark = () => {
    if (!post) return;
    toggleBookmark({ postId: post.id, isBookmarked: post.isBookmarked });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-destructive mb-2">Không tìm thấy bài viết</h2>
          <p className="text-muted-foreground mb-4">
            Bài viết có thể đã bị xóa hoặc bạn không có quyền truy cập
          </p>
          <Button asChild>
            <Link href="/forum">Quay lại diễn đàn</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      <Breadcrumbs />

      <article className="space-y-6">
        {/* Post Header */}
        <div className="flex gap-4">
          <VoteButtons postId={post.id} score={post.voteScore} userVote={post.userVote} />

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h1 className="text-3xl font-bold flex-1">{post.title}</h1>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isAuthenticated && (
                      <DropdownMenuItem onClick={handleBookmark}>
                        {post.isBookmarked ? (
                          <>
                            <BookmarkCheck className="mr-2 h-4 w-4" />
                            Bỏ lưu
                          </>
                        ) : (
                          <>
                            <Bookmark className="mr-2 h-4 w-4" />
                            Lưu bài viết
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    {canEdit && (
                      <DropdownMenuItem asChild>
                        <Link href={`/forum/${post.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
                            deletePost(post.id);
                          }
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa bài viết
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Flag className="mr-2 h-4 w-4" />
                      Báo cáo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline">{post.category.name}</Badge>
                <Badge variant="secondary">{post.postType}</Badge>
                {post.isPinned && (
                  <Badge variant="default">
                    <Pin className="mr-1 h-3 w-3" />
                    Đã ghim
                  </Badge>
                )}
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/forum/tags/${tag.slug}`}>
                    <Badge variant="secondary" className="hover:bg-secondary/80">
                      #{tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.fullName[0]}</AvatarFallback>
                  </Avatar>
                  <Link href={`/profile/${post.authorId}`} className="font-medium hover:underline">
                    {post.author.fullName}
                  </Link>
                </div>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.viewCount} lượt xem</span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{post.content}</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-t" />

        {/* Comments */}
        <CommentSection postId={post.id} />
      </article>
    </div>
  );
}
