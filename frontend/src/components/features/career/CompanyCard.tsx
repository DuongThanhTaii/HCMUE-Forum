'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Users, ExternalLink } from 'lucide-react';
import { Link } from '@/lib/i18n/routing';
import type { Company } from '@/types/api/career.types';

interface CompanyCardProps {
  company: Company;
  jobsCount?: number;
}

export function CompanyCard({ company, jobsCount }: CompanyCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start space-x-4">
          {company.logo && (
            <img
              src={company.logo}
              alt={company.name}
              className="h-16 w-16 rounded object-cover"
            />
          )}
          <div className="flex-1">
            <Link href={`/career/companies/${company.id}`}>
              <CardTitle className="hover:text-primary hover:underline">
                {company.name}
              </CardTitle>
            </Link>
            <div className="mt-2 flex flex-wrap gap-2">
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
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {company.description && (
          <p className="text-muted-foreground line-clamp-3 text-sm">
            {company.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          {jobsCount !== undefined && (
            <span className="text-sm text-muted-foreground">
              {jobsCount} việc làm đang tuyển
            </span>
          )}

          <div className="flex gap-2">
            {company.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Website
                </a>
              </Button>
            )}
            <Button size="sm" asChild>
              <Link href={`/career/companies/${company.id}`}>Xem chi tiết</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
