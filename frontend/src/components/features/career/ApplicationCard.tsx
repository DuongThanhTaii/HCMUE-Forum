'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { Link } from '@/lib/i18n/routing';
import { useWithdrawApplication } from '@/hooks/api/career/useWithdrawApplication';
import type { Application } from '@/types/api/career.types';

interface ApplicationCardProps {
  application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const { mutate: withdraw, isPending } = useWithdrawApplication();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Offered':
        return 'default';
      case 'Interviewed':
        return 'secondary';
      case 'Reviewing':
        return 'secondary';
      case 'Pending':
        return 'outline';
      case 'Rejected':
        return 'destructive';
      case 'Withdrawn':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      Pending: 'Chờ xử lý',
      Reviewing: 'Đang xem xét',
      Interviewed: 'Đã phỏng vấn',
      Offered: 'Được chấp nhận',
      Rejected: 'Bị từ chối',
      Withdrawn: 'Đã rút',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Offered':
        return <CheckCircle2 className="mr-1 h-4 w-4" />;
      case 'Rejected':
        return <XCircle className="mr-1 h-4 w-4" />;
      case 'Withdrawn':
        return <XCircle className="mr-1 h-4 w-4" />;
      default:
        return <Clock className="mr-1 h-4 w-4" />;
    }
  };

  const canWithdraw = () => {
    return ['Pending', 'Reviewing'].includes(application.status);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <Link href={`/career/jobs/${application.jobPosting.id}`}>
              <CardTitle className="hover:text-primary hover:underline">
                {application.jobPosting.title}
              </CardTitle>
            </Link>
            <p className="text-muted-foreground mt-1 text-sm">
              {application.jobPosting.company.name}
            </p>
          </div>
          <Badge variant={getStatusColor(application.status)}>
            {getStatusIcon(application.status)}
            {getStatusLabel(application.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          Nộp đơn: {new Date(application.appliedAt).toLocaleDateString('vi-VN')}
        </div>

        {application.notes && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium">Ghi chú từ nhà tuyển dụng:</p>
            <p className="text-muted-foreground mt-1">{application.notes}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/career/applications/${application.id}`}>
              <FileText className="mr-2 h-4 w-4" />
              Xem chi tiết
            </Link>
          </Button>

          {canWithdraw() && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => withdraw(application.id)}
              disabled={isPending}
            >
              Rút đơn
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
