import { Link } from '@/lib/i18n/routing';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Download, Eye, FileText } from 'lucide-react';
import type { Document } from '@/types/api/learning.types';

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'default';
      case 'Pending':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Lecture: 'Bài giảng',
      Assignment: 'Bài tập',
      Exam: 'Đề thi',
      Reference: 'Tài liệu tham khảo',
      Other: 'Khác',
    };
    return labels[type] || type;
  };

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardContent className="flex-1 pt-6">
        <div className="mb-3 flex items-start justify-between">
          <FileText className="text-primary h-8 w-8 flex-shrink-0" />
          <Badge variant={getStatusColor(document.status)}>{document.status}</Badge>
        </div>

        <Link href={`/learning/documents/${document.id}`}>
          <h3 className="hover:text-primary mb-2 line-clamp-2 text-lg font-semibold hover:underline">
            {document.title}
          </h3>
        </Link>

        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{document.description}</p>

        <div className="mb-3">
          <Badge variant="outline" className="mr-2">
            {getTypeLabel(document.documentType)}
          </Badge>
        </div>

        <div className="text-muted-foreground space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium">{document.course.name}</span>
            <span>{formatFileSize(document.fileSize)}</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{document.averageRating.toFixed(1)}</span>
              <span>({document.ratingCount})</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="h-3 w-3" />
              <span>{document.downloadCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{document.viewCount}</span>
            </div>
          </div>

          <div className="text-xs">
            <span>Tải lên bởi: </span>
            <span className="font-medium">{document.uploader.fullName}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/learning/documents/${document.id}`}>Xem chi tiết</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
