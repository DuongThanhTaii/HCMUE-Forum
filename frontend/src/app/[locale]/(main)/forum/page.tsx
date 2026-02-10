'use client';

import { useState } from 'react';
import { usePosts } from '@/hooks/api/forum/usePosts';
import { PostCard } from '@/components/features/forum/PostCard';
import { PostFilters } from '@/components/features/forum/PostFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle, MessageCircle } from 'lucide-react';
import { Link } from '@/lib/i18n/routing';
import { Breadcrumbs } from '@/components/shared/layouts/Breadcrumbs';
import { useTranslations } from 'next-intl';
import type { PostsQueryParams } from '@/types/api/forum.types';

export default function ForumPage() {
  const t = useTranslations('forum');
  const [filters, setFilters] = useState<PostsQueryParams>({
    page: 1,
    pageSize: 20,
  });

  const { data, isLoading, error } = usePosts(filters);

  const handleLoadMore = () => {
    setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Diễn đàn</h1>
          <p className="text-muted-foreground mt-1">
            Đặt câu hỏi, chia sẻ kiến thức và kết nối với cộng đồng
          </p>
        </div>
        <Button asChild>
          <Link href="/forum/create">
            <Plus className="mr-2 h-4 w-4" />
            Tạo bài viết
          </Link>
        </Button>
      </div>

      <PostFilters filters={filters} onChange={setFilters} />

      <div className="grid gap-4">
        {isLoading && filters.page === 1 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))
        ) : error ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-2" />
            <h3 className="text-lg font-semibold text-destructive">Không thể tải bài viết</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Vui lòng thử lại sau hoặc liên hệ hỗ trợ
            </p>
          </div>
        ) : data?.items.length === 0 ? (
          <div className="rounded-lg border p-12 text-center">
            <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">Chưa có bài viết nào</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Hãy là người đầu tiên chia sẻ kiến thức của bạn
            </p>
            <Button asChild>
              <Link href="/forum/create">
                <Plus className="mr-2 h-4 w-4" />
                Tạo bài viết đầu tiên
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {data?.items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {data && data.totalPages > (filters.page || 1) && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                  {isLoading ? 'Đang tải...' : 'Tải thêm'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {data && data.items.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Hiển thị {data.items.length} / {data.totalItems} bài viết
        </div>
      )}
    </div>
  );
}
