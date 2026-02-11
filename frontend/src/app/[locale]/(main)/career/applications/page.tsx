'use client';

import { useMyApplications } from '@/hooks/api/career/useMyApplications';
import { ApplicationCard } from '@/components/features/career/ApplicationCard';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

export default function MyApplicationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyApplications(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Đơn ứng tuyển của tôi</h1>
        <p className="text-muted-foreground mt-1">
          {data?.totalCount || 0} đơn ứng tuyển
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="space-y-4">
          {data.items.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Chưa có đơn ứng tuyển nào</h3>
          <p className="text-muted-foreground mt-2">
            Hãy tìm việc và nộp đơn ứng tuyển ngay
          </p>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1 || isLoading}
            onClick={() => setPage(page - 1)}
          >
            Trang trước
          </Button>
          <span className="flex items-center px-4">
            Trang {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === data.totalPages || isLoading}
            onClick={() => setPage(page + 1)}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}
