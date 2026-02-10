'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { useCategories } from '@/hooks/api/forum/useCategories';
import type { PostType, PostStatus } from '@/types/api/forum.types';

interface PostFiltersProps {
  filters: {
    category?: string;
    type?: PostType;
    status?: PostStatus;
    tag?: string;
  };
  onChange: (filters: any) => void;
}

export function PostFilters({ filters, onChange }: PostFiltersProps) {
  const { data: categories } = useCategories();

  const handleClearFilters = () => {
    onChange({});
  };

  const hasActiveFilters = filters.category || filters.type || filters.status || filters.tag;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.category || 'all'}
        onValueChange={(value) =>
          onChange({ ...filters, category: value === 'all' ? undefined : value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Danh mục" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả danh mục</SelectItem>
          {categories?.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.type || 'all'}
        onValueChange={(value) =>
          onChange({ ...filters, type: value === 'all' ? undefined : (value as PostType) })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Loại bài viết" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả loại</SelectItem>
          <SelectItem value="Discussion">Thảo luận</SelectItem>
          <SelectItem value="Question">Câu hỏi</SelectItem>
          <SelectItem value="Announcement">Thông báo</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={handleClearFilters}>
          <X className="mr-1 h-4 w-4" />
          Xóa bộ lọc
        </Button>
      )}

      {filters.tag && (
        <Badge variant="secondary" className="px-3 py-1">
          #{filters.tag}
          <button
            onClick={() => onChange({ ...filters, tag: undefined })}
            className="ml-2 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  );
}
