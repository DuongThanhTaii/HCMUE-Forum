'use client';

import { useState, use } from 'react';
import { useJob } from '@/hooks/api/career/useJob';
import { useSubmitApplication } from '@/hooks/api/career/useSubmitApplication';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileUploader } from '@/components/shared/FileUploader';
import { Building2, MapPin, DollarSign, Clock, Send, Loader2, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@/lib/i18n/routing';
import { useSaveJob } from '@/hooks/api/career/useSaveJob';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: job, isLoading } = useJob(id);
  const { mutate: submitApplication, isPending } = useSubmitApplication();
  const { mutate: toggleSave } = useSaveJob();
  const [coverLetter, setCoverLetter] = useState('');
  const [cv, setCV] = useState<File | null>(null);
  const [isSaved, setIsSaved] = useState(job?.isSaved || false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleApply = () => {
    if (!coverLetter || !cv) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    submitApplication(
      {
        jobPostingId: params.id,
        coverLetter,
        cv,
      },
      {
        onSuccess: () => {
          toast.success('Nộp đơn thành công!');
          setDialogOpen(false);
          setCoverLetter('');
          setCV(null);
        },
      }
    );
  };

  const handleSave = () => {
    toggleSave({ jobId: params.id, save: !isSaved });
    setIsSaved(!isSaved);
  };

  const formatSalary = () => {
    if (!job) return '';
    if (!job.salaryMin && !job.salaryMax) return 'Thỏa thuận';
    if (!job.salaryMax)
      return `Từ ${job.salaryMin?.toLocaleString()} VNĐ`;
    return `${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()} VNĐ`;
  };

  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FullTime: 'Toàn thời gian',
      PartTime: 'Bán thời gian',
      Contract: 'Hợp đồng',
      Internship: 'Thực tập',
      Freelance: 'Freelance',
    };
    return labels[type] || type;
  };

  if (isLoading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (!job)
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold">Không tìm thấy công việc</h2>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <Link
                href={`/career/companies/${job.company.id}`}
                className="hover:text-primary mt-2 flex items-center text-muted-foreground hover:underline"
              >
                <Building2 className="mr-2 h-4 w-4" />
                <span>{job.company.name}</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {job.company.logo && (
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="h-16 w-16 rounded object-cover"
                />
              )}
              <Button variant="ghost" size="icon" onClick={handleSave}>
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current text-primary' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge>
              <MapPin className="mr-1 h-3 w-3" />
              {job.location}
            </Badge>
            <Badge>
              <DollarSign className="mr-1 h-3 w-3" />
              {formatSalary()}
            </Badge>
            <Badge variant="outline">{getJobTypeLabel(job.jobType)}</Badge>
            <Badge variant="outline">{job.experienceLevel}</Badge>
            <Badge variant="secondary">
              <Clock className="mr-1 h-3 w-3" />
              Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}
            </Badge>
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-lg font-semibold">Mô tả công việc</h3>
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </div>

          <div>
            <h3 className="mb-2 text-lg font-semibold">Yêu cầu</h3>
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: job.requirements }}
            />
          </div>

          {job.benefits && (
            <div>
              <h3 className="mb-2 text-lg font-semibold">Quyền lợi</h3>
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: job.benefits }}
              />
            </div>
          )}

          <Separator />

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Nộp đơn ứng tuyển
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nộp đơn ứng tuyển: {job.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="coverLetter">Thư xin việc *</Label>
                  <Textarea
                    id="coverLetter"
                    placeholder="Viết vài dòng giới thiệu bản thân..."
                    className="min-h-[150px]"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="cv">CV (PDF) *</Label>
                  <FileUploader
                    accept=".pdf"
                    maxSize={5 * 1024 * 1024}
                    onChange={setCV}
                  />
                  <p className="text-muted-foreground mt-1 text-xs">
                    File PDF, tối đa 5MB
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleApply}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang nộp...
                    </>
                  ) : (
                    'Nộp đơn'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
