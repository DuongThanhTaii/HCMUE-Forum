'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useApprovalQueue } from '@/hooks/api/learning/useApprovalQueue';
import { useApproveDocument } from '@/hooks/api/learning/useApproveDocument';
import { useRejectDocument } from '@/hooks/api/learning/useRejectDocument';
import { FileText, User, Calendar, Loader2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Document } from '@/types/api/learning.types';

export default function ApprovalQueuePage() {
  const { data: documents, isLoading, isError } = useApprovalQueue();
  const approveMutation = useApproveDocument();
  const rejectMutation = useRejectDocument();

  const [rejectDialog, setRejectDialog] = useState<{
    isOpen: boolean;
    document: Document | null;
  }>({ isOpen: false, document: null });
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = (documentId: string) => {
    approveMutation.mutate(documentId);
  };

  const handleRejectClick = (document: Document) => {
    setRejectDialog({ isOpen: true, document });
    setRejectReason('');
  };

  const handleRejectConfirm = () => {
    if (!rejectDialog.document || !rejectReason.trim()) return;

    rejectMutation.mutate(
      { documentId: rejectDialog.document.id, reason: rejectReason.trim() },
      {
        onSuccess: () => {
          setRejectDialog({ isOpen: false, document: null });
          setRejectReason('');
        },
      }
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">Kiểm duyệt tài liệu</h1>
        <p className="text-muted-foreground mt-1">Phê duyệt hoặc từ chối tài liệu chờ kiểm duyệt</p>
      </div>

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

      {documents && documents.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Không có tài liệu nào đang chờ duyệt</p>
        </div>
      )}

      {documents && documents.length > 0 && (
        <div className="space-y-4">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2 text-xl">{document.title}</CardTitle>
                    <Badge variant="secondary">Chờ duyệt</Badge>
                  </div>
                  <FileText className="text-muted-foreground h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">{document.description}</p>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <User className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="font-medium">Người tải lên</p>
                        <p className="text-muted-foreground">{document.uploader.fullName}</p>
                        <p className="text-muted-foreground text-xs">{document.uploader.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div>
                        <p className="font-medium">Ngày tải lên</p>
                        <p className="text-muted-foreground">
                          {format(new Date(document.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="font-medium">Môn học</p>
                      <p className="text-muted-foreground">{document.course.name}</p>
                      <p className="text-muted-foreground text-xs">
                        Khoa: {document.course.faculty.name}
                      </p>
                    </div>

                    <div>
                      <p className="font-medium">File</p>
                      <p className="text-muted-foreground">{document.fileName}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(document.fileSize)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
                  <Button
                    variant="default"
                    onClick={() => handleApprove(document.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="flex-1"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Phê duyệt
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRejectClick(document)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Từ chối
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(document.fileUrl, '_blank')}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    Xem file
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={rejectDialog.isOpen}
        onOpenChange={(open) => !open && setRejectDialog({ isOpen: false, document: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối tài liệu</DialogTitle>
            <DialogDescription>Vui lòng nhập lý do từ chối tài liệu này</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do từ chối</Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-muted-foreground text-xs">{rejectReason.length}/500 ký tự</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialog({ isOpen: false, document: null })}
              disabled={rejectMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim() || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận từ chối'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
