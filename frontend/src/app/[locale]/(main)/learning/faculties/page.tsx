'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFaculties } from '@/hooks/api/learning/useFaculties';
import { Link } from '@/lib/i18n/routing';
import { BookOpen, FileText, Loader2 } from 'lucide-react';

export default function FacultiesPage() {
  const { data: faculties, isLoading, isError } = useFaculties();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Danh sách các khoa</h1>
        <p className="text-muted-foreground mt-1">
          Khám phá các khoa và môn học liên quan
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <p className="text-destructive">Không thể tải danh sách khoa</p>
        </div>
      )}

      {faculties && faculties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không có khoa nào</p>
        </div>
      )}

      {faculties && faculties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculties.map((faculty) => (
            <Card key={faculty.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{faculty.name}</CardTitle>
                <Badge variant="secondary" className="w-fit">
                  {faculty.code}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {faculty.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-xs">Môn học</span>
                    </div>
                    <p className="text-2xl font-bold">{faculty.courseCount}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">Tài liệu</span>
                    </div>
                    <p className="text-2xl font-bold">{faculty.documentCount}</p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 pt-2">
                  <Button variant="outline" asChild>
                    <Link href={`/learning/courses?facultyId=${faculty.id}`}>
                      Xem môn học
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/learning/documents?facultyId=${faculty.id}`}>
                      Xem tài liệu
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
