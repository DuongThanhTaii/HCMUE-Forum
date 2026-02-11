'use client';

import { useState } from 'react';
import { useJobs } from '@/hooks/api/career/useJobs';
import { JobCard } from '@/components/features/career/JobCard';
import { JobFilters as JobFiltersComponent } from '@/components/features/career/JobFilters';
import { Button } from '@/components/ui/button';
import { Briefcase, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@/lib/i18n/routing';
import { useAuth } from '@/hooks/auth/useAuth';
import type { JobFilters } from '@/types/api/career.types';

export default function JobsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<JobFilters>({
    location: '',
    jobType: '',
    experienceLevel: '',
    page: 1,
  });

  const { data, isLoading } = useJobs(filters);
  const isRecruiter = user?.roles?.includes('Recruiter');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tìm việc làm</h1>
          <p className="text-muted-foreground mt-1">
            {data?.totalCount || 0} công việc phù hợp
          </p>
        </div>
        {isRecruiter && (
          <Button asChild>
            <Link href="/career/jobs/create">
              <Briefcase className="mr-2 h-4 w-4" />
              Đăng tin
            </Link>
          </Button>
        )}
      </div>

      <JobFiltersComponent filters={filters} onChange={setFilters} />

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
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Không tìm thấy việc làm</h3>
          <p className="text-muted-foreground mt-2">
            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={filters.page === 1 || isLoading}
            onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
          >
            Trang trước
          </Button>
          <span className="flex items-center px-4">
            Trang {filters.page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={filters.page === data.totalPages || isLoading}
            onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}
