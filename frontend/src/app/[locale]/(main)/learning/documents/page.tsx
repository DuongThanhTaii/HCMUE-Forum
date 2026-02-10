'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DocumentCard } from '@/components/features/learning/DocumentCard';
import { DocumentFilters } from '@/components/features/learning/DocumentFilters';
import { useDocuments } from '@/hooks/api/learning/useDocuments';
import { Link } from '@/lib/i18n/routing';
import { Plus, Loader2 } from 'lucide-react';
import type { DocumentType, DocumentStatus } from '@/types/api/learning.types';

export default function DocumentsPage() {
  const [filters, setFilters] = useState<{
    facultyId?: string;
    courseId?: string;
    documentType?: DocumentType;
    status?: DocumentStatus;
    search?: string;
    page?: number;
  }>({ page: 1 });

  const { data, isLoading, isError } = useDocuments(filters);

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tài liệu học tập</h1>
          <p className="text-muted-foreground mt-1">Khám phá và tải xuống tài liệu học tập</p>
        </div>
        <Button asChild>
          <Link href="/learning/documents/upload">
            <Plus className="mr-2 h-4 w-4" />
            Tải lên tài liệu
          </Link>
        </Button>
      </div>

      <DocumentFilters filters={filters} onChange={setFilters} />

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="py-12 text-center">
          <p className="text-destructive">Không thể tải danh sách tài liệu</p>
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Không tìm thấy tài liệu nào</p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <Button
                variant="outline"
                onClick={() => handlePageChange(data.page - 1)}
                disabled={data.page === 1}
              >
                Trước
              </Button>
              <span className="text-muted-foreground text-sm">
                Trang {data.page} / {data.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(data.page + 1)}
                disabled={data.page === data.totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
