'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RatingStars } from '@/components/shared/RatingStars';
import { useDocument } from '@/hooks/api/learning/useDocument';
import { useRateDocument } from '@/hooks/api/learning/useRateDocument';
import { useDownloadDocument } from '@/hooks/api/learning/useDownloadDocument';
import { Download, Eye, Star, Calendar, User, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const { data: document, isLoading } = useDocument(documentId);
  const rateDocumentMutation = useRateDocument(documentId);
  const downloadDocumentMutation = useDownloadDocument();

  const handleSubmitRating = () => {
    if (rating === 0) return;
    rateDocumentMutation.mutate(
      { rating, review: review.trim() || undefined },
      {
        onSuccess: () => {
          setRating(0);
          setReview('');
        },
      }
    );
  };

  const handleDownload = () => {
    if (!document) return;
    downloadDocumentMutation.mutate(documentId);
    window.open(document.fileUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-destructive">Không tìm thấy tài liệu</p>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl">{document.title}</CardTitle>
                <Badge variant={document.status === 'Approved' ? 'default' : 'secondary'}>
                  {document.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{document.description}</p>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{document.averageRating.toFixed(1)}</span>
                  <span>({document.ratingCount} đánh giá)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>{document.downloadCount} lượt tải</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{document.viewCount} lượt xem</span>
                </div>
              </div>

              <Button onClick={handleDownload} className="w-full" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Tải xuống tài liệu
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Đánh giá tài liệu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Đánh giá của bạn</label>
                <RatingStars value={rating} onChange={setRating} size="lg" />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Nhận xét (tùy chọn)</label>
                <Textarea
                  placeholder="Chia sẻ ý kiến của bạn về tài liệu này..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {review.length}/500 ký tự
                </p>
              </div>

              <Button
                onClick={handleSubmitRating}
                disabled={rating === 0 || rateDocumentMutation.isPending}
                className="w-full"
              >
                {rateDocumentMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin tài liệu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Tên file</p>
                  <p className="text-sm text-muted-foreground">{document.fileName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Kích thước</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(document.fileSize)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Ngày tải lên</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(document.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Tải lên bởi</p>
                  <p className="text-sm text-muted-foreground">{document.uploader.fullName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Môn học</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{document.course.name}</p>
              <p className="text-sm text-muted-foreground">Mã: {document.course.code}</p>
              <p className="text-sm text-muted-foreground">
                Khoa: {document.course.faculty.name}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
