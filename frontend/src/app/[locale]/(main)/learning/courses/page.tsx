'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCourses } from '@/hooks/api/learning/useCourses';
import { useFaculties } from '@/hooks/api/learning/useFaculties';
import { Link } from '@/lib/i18n/routing';
import { FileText, Loader2 } from 'lucide-react';

export default function CoursesPage() {
  const [filters, setFilters] = useState<{
    facultyId?: string;
    semester?: string;
    page?: number;
  }>({ page: 1 });

  const { data: faculties } = useFaculties();
  const { data, isLoading, isError } = useCourses(filters);

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Danh sách môn học</h1>
        <p className="text-muted-foreground mt-1">
          Khám phá các môn học và tài liệu liên quan
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={filters.facultyId || 'all'}
          onValueChange={(value) =>
            setFilters({ ...filters, facultyId: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Chọn khoa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khoa</SelectItem>
            {faculties?.map((faculty) => (
              <SelectItem key={faculty.id} value={faculty.id}>
                {faculty.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.semester?.toString() || 'all'}
          onValueChange={(value) =>
            setFilters({ ...filters, semester: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Học kỳ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả học kỳ</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <SelectItem key={sem} value={sem.toString()}>
                Học kỳ {sem}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <p className="text-destructive">Không thể tải danh sách môn học</p>
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy môn học nào</p>
        </div>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{course.name}</CardTitle>
                    <Badge variant="secondary">HK{course.semester}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Mã: {course.code}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Khoa:</span>
                    <span className="font-medium">{course.faculty.name}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Số tín chỉ:</span>
                    <span className="font-medium">{course.credits}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{course.documentCount} tài liệu</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/learning/documents?courseId=${course.id}`}>
                        Xem tài liệu
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-6">
              <Button
                variant="outline"
                onClick={() => handlePageChange(data.page - 1)}
                disabled={data.page === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-muted-foreground">
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
