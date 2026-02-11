'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { JobFilters as Filters } from '@/types/api/career.types';

interface JobFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function JobFilters({ filters, onChange }: JobFiltersProps) {
  const handleChange = (key: keyof Filters, value: string | number) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const handleReset = () => {
    onChange({
      location: '',
      jobType: '',
      experienceLevel: '',
      salaryMin: undefined,
      salaryMax: undefined,
      page: 1,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label htmlFor="location">Địa điểm</Label>
            <Input
              id="location"
              placeholder="VD: Hồ Chí Minh"
              value={filters.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="jobType">Loại công việc</Label>
            <Select
              value={filters.jobType || ''}
              onValueChange={(value) => handleChange('jobType', value)}
            >
              <SelectTrigger id="jobType">
                <SelectValue placeholder="Chọn loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FullTime">Toàn thời gian</SelectItem>
                <SelectItem value="PartTime">Bán thời gian</SelectItem>
                <SelectItem value="Contract">Hợp đồng</SelectItem>
                <SelectItem value="Internship">Thực tập</SelectItem>
                <SelectItem value="Freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="experienceLevel">Cấp độ</Label>
            <Select
              value={filters.experienceLevel || ''}
              onValueChange={(value) => handleChange('experienceLevel', value)}
            >
              <SelectTrigger id="experienceLevel">
                <SelectValue placeholder="Chọn cấp độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Intern">Thực tập sinh</SelectItem>
                <SelectItem value="Fresher">Mới tốt nghiệp</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Middle">Middle</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="salaryMin">Lương tối thiểu (VNĐ)</Label>
            <Input
              id="salaryMin"
              type="number"
              placeholder="VD: 10000000"
              value={filters.salaryMin || ''}
              onChange={(e) => handleChange('salaryMin', parseInt(e.target.value) || '')}
            />
          </div>

          <div>
            <Label htmlFor="salaryMax">Lương tối đa (VNĐ)</Label>
            <Input
              id="salaryMax"
              type="number"
              placeholder="VD: 20000000"
              value={filters.salaryMax || ''}
              onChange={(e) => handleChange('salaryMax', parseInt(e.target.value) || '')}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <X className="mr-2 h-4 w-4" />
            Xóa bộ lọc
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
