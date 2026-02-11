'use client';

import { useSavedJobs } from '@/hooks/api/career/useSavedJobs';
import { JobCard } from '@/components/features/career/JobCard';
import { Button } from '@/components/ui/button';
import { Loader2, Bookmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

export default function SavedJobsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSavedJobs(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Việc làm đã lưu</h1>
        <p className="text-muted-foreground mt-1">
          {data?.totalCount || 0} việc làm
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.items.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Chưa có việc làm đã lưu</h3>
          <p className="text-muted-foreground mt-2">
            Lưu các việc làm quan tâm để xem sau
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
