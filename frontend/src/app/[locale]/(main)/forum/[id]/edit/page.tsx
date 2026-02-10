'use client';

import { use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@/lib/i18n/routing';
import { usePost } from '@/hooks/api/forum/usePost';
import { useUpdatePost } from '@/hooks/api/forum/useUpdatePost';
import { useCategories } from '@/hooks/api/forum/useCategories';
import { useTags } from '@/hooks/api/forum/useTags';
import { postSchema, type PostInput } from '@/lib/validations/post.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/layouts/Breadcrumbs';
import { X, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from '@/lib/i18n/routing';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: post, isLoading: isLoadingPost } = usePost(id);
  const { mutate: updatePost, isPending } = useUpdatePost(id);
  const { data: categories } = useCategories();
  const { data: allTags } = useTags();
  const [tagInput, setTagInput] = useState('');

  const form = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
      postType: 'Discussion',
      tags: [],
      status: 'Published',
    },
  });

  // Populate form when post data loads
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content,
        categoryId: post.categoryId,
        postType: post.postType,
        tags: post.tags.map((tag) => tag.name),
        status: post.status,
      });
    }
  }, [post, form]);

  const selectedTags = form.watch('tags') || [];

  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim().toLowerCase();
    if (trimmed && !selectedTags.includes(trimmed) && selectedTags.length < 5) {
      form.setValue('tags', [...selectedTags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      'tags',
      selectedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const onSubmit = (data: PostInput) => {
    updatePost(data, {
      onSuccess: () => {
        router.push(`/forum/${id}`);
      },
    });
  };

  if (isLoadingPost) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-destructive mb-2">
            Không tìm thấy bài viết
          </h2>
          <p className="text-muted-foreground mb-4">
            Bài viết có thể đã bị xóa hoặc bạn không có quyền chỉnh sửa
          </p>
          <Button asChild>
            <Link href="/forum">Quay lại diễn đàn</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
      <Breadcrumbs />

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Chỉnh sửa bài viết</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tiêu đề bài viết..."
                        {...field}
                        className="text-lg"
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value.length} / 200 ký tự (tối thiểu 10)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại bài viết *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Discussion">Thảo luận</SelectItem>
                          <SelectItem value="Question">Câu hỏi</SelectItem>
                          <SelectItem value="Announcement">Thông báo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Viết nội dung bài viết của bạn..."
                        className="min-h-[300px] font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value.length} / 50,000 ký tự (tối thiểu 50)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={() => (
                  <FormItem>
                    <FormLabel>Tags * (1-5 tags)</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nhập tag và nhấn Enter..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag(tagInput);
                              }
                            }}
                            disabled={selectedTags.length >= 5}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleAddTag(tagInput)}
                            disabled={!tagInput.trim() || selectedTags.length >= 5}
                          >
                            Thêm
                          </Button>
                        </div>

                        {selectedTags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedTags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="px-3 py-1">
                                #{tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-2 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}

                        {allTags && allTags.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <p className="mb-2">Tags phổ biến:</p>
                            <div className="flex flex-wrap gap-2">
                              {allTags.slice(0, 10).map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant="outline"
                                  className="cursor-pointer hover:bg-secondary"
                                  onClick={() => handleAddTag(tag.name)}
                                >
                                  #{tag.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Đang cập nhật...' : 'Cập nhật bài viết'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
