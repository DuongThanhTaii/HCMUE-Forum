'use client';

import { Link } from '@/lib/i18n/routing';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, DollarSign, Clock, Bookmark } from 'lucide-react';
import { useSaveJob } from '@/hooks/api/career/useSaveJob';
import { useState } from 'react';
import type { JobPosting } from '@/types/api/career.types';

interface JobCardProps {
  job: JobPosting;
}

export function JobCard({ job }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(job.isSaved);
  const { mutate: toggleSave } = useSaveJob();

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleSave({ jobId: job.id, save: !isSaved });
    setIsSaved(!isSaved);
  };

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return 'Thỏa thuận';
    if (!job.salaryMax) return `Từ ${job.salaryMin?.toLocaleString()} VNĐ`;
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

  const getExperienceLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      Intern: 'Thực tập sinh',
      Fresher: 'Mới tốt nghiệp',
      Junior: 'Junior',
      Middle: 'Middle',
      Senior: 'Senior',
      Lead: 'Lead',
    };
    return labels[level] || level;
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex space-x-4">
            {job.company.logo && (
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="h-12 w-12 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <Link href={`/career/jobs/${job.id}`}>
                <h3 className="text-lg font-semibold hover:text-primary hover:underline">
                  {job.title}
                </h3>
              </Link>
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                <Building2 className="mr-1 h-4 w-4" />
                <Link
                  href={`/career/companies/${job.company.id}`}
                  className="hover:underline"
                >
                  {job.company.name}
                </Link>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className={isSaved ? 'text-primary' : ''}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">
            <MapPin className="mr-1 h-3 w-3" />
            {job.location}
          </Badge>
          <Badge variant="secondary">
            <DollarSign className="mr-1 h-3 w-3" />
            {formatSalary()}
          </Badge>
          <Badge variant="outline">{getJobTypeLabel(job.jobType)}</Badge>
          <Badge variant="outline">{getExperienceLevelLabel(job.experienceLevel)}</Badge>
        </div>

        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          Hạn nộp: {new Date(job.deadline).toLocaleDateString('vi-VN')}
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" asChild>
          <Link href={`/career/jobs/${job.id}`}>Xem chi tiết</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
