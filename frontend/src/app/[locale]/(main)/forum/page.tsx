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
    <div className="container mx-auto space-y-6 px-4 py-6">
      <Breadcrumbs />

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
        ) : error ? (
          <div className="border-destructive bg-destructive/10 rounded-lg border p-6 text-center">
            <AlertCircle className="text-destructive mx-auto mb-2 h-12 w-12" />
            <h3 className="text-destructive text-lg font-semibold">Không thể tải bài viết</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Vui lòng thử lại sau hoặc liên hệ hỗ trợ
            </p>
          </div>
        ) : data?.items.length === 0 ? (
          <div className="rounded-lg border p-12 text-center">
            <MessageCircle className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
            <h3 className="text-lg font-semibold">Chưa có bài viết nào</h3>
            <p className="text-muted-foreground mt-1 mb-4 text-sm">
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
        <div className="text-muted-foreground text-center text-sm">
          Hiển thị {data.items.length} / {data.totalItems} bài viết
        </div>
      )}
    </div>
  );
}
