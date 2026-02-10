'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import { useFaculties } from '@/hooks/api/learning/useFaculties';
import { useCourses } from '@/hooks/api/learning/useCourses';
import type { DocumentType, DocumentStatus } from '@/types/api/learning.types';
import { useState } from 'react';

interface DocumentFiltersProps {
  filters: {
    facultyId?: string;
    courseId?: string;
    documentType?: DocumentType;
    status?: DocumentStatus;
    search?: string;
  };
  onChange: (filters: any) => void;
}

export function DocumentFilters({ filters, onChange }: DocumentFiltersProps) {
  const { data: faculties } = useFaculties();
  const { data: coursesData } = useCourses({ facultyId: filters.facultyId });
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleClearFilters = () => {
    setSearchInput('');
    onChange({});
  };

  const handleSearch = () => {
    onChange({ ...filters, search: searchInput });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasActiveFilters =
    filters.facultyId ||
    filters.courseId ||
    filters.documentType ||
    filters.status ||
    filters.search;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Input
            placeholder="Tìm kiếm tài liệu..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="pr-10"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearch}
            className="absolute top-1 right-1 h-7 w-7 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Select
          value={filters.facultyId || 'all'}
          onValueChange={(value) => {
            onChange({
              ...filters,
              facultyId: value === 'all' ? undefined : value,
              courseId: undefined, // Reset course when faculty changes
            });
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
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
          value={filters.courseId || 'all'}
          onValueChange={(value) =>
            onChange({ ...filters, courseId: value === 'all' ? undefined : value })
          }
          disabled={!filters.facultyId}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Chọn môn học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả môn học</SelectItem>
            {coursesData?.items.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.documentType || 'all'}
          onValueChange={(value) =>
            onChange({
              ...filters,
              documentType: value === 'all' ? undefined : (value as DocumentType),
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại tài liệu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            <SelectItem value="Lecture">Bài giảng</SelectItem>
            <SelectItem value="Assignment">Bài tập</SelectItem>
            <SelectItem value="Exam">Đề thi</SelectItem>
            <SelectItem value="Reference">Tài liệu tham khảo</SelectItem>
            <SelectItem value="Other">Khác</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
}
