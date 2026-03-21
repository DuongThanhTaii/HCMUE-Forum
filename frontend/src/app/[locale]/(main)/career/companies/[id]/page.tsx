'use client';

import { useCompany } from '@/hooks/api/career/useCompany';
import { useCompanyJobs } from '@/hooks/api/career/useCompanyJobs';
import { JobCard } from '@/components/features/career/JobCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Users, ExternalLink, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, use } from 'react';

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: company, isLoading: loadingCompany } = useCompany(id);
  const [page, setPage] = useState(1);
  const { data: jobs, isLoading: loadingJobs } = useCompanyJobs(id, page);

  if (loadingCompany)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (!company)
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold">Không tìm thấy công ty</h2>
      </div>
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start space-x-4">
            {company.logo && (
              <img
                src={company.logo}
                alt={company.name}
                className="h-24 w-24 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-3xl">{company.name}</CardTitle>
              <div className="mt-4 flex flex-wrap gap-2">
                {company.industry && (
                  <Badge variant="secondary">
                    <Building2 className="mr-1 h-3 w-3" />
                    {company.industry}
                  </Badge>
                )}
                {company.size && (
                  <Badge variant="outline">
                    <Users className="mr-1 h-3 w-3" />
                    {company.size}
                  </Badge>
                )}
                {company.location && (
                  <Badge variant="outline">
                    <MapPin className="mr-1 h-3 w-3" />
                    {company.location}
                  </Badge>
                )}
              </div>
              {company.website && (
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Truy cập website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {company.description && (
          <CardContent>
            <h3 className="mb-2 text-lg font-semibold">Giới thiệu</h3>
            <p className="text-muted-foreground">{company.description}</p>
          </CardContent>
        )}
      </Card>

      <div>
        <h2 className="mb-4 text-2xl font-bold">
          Việc làm tại {company.name} ({jobs?.totalCount || 0})
        </h2>

        {loadingJobs ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : jobs && jobs.items.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {jobs.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              Hiện tại công ty chưa có tin tuyển dụng nào
            </p>
          </div>
        )}

        {jobs && jobs.totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1 || loadingJobs}
              onClick={() => setPage(page - 1)}
            >
              Trang trước
            </Button>
            <span className="flex items-center px-4">
              Trang {page} / {jobs.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === jobs.totalPages || loadingJobs}
              onClick={() => setPage(page + 1)}
            >
              Trang sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
