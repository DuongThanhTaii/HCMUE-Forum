import { z } from 'zod';

export const postSchema = z.object({
  title: z
    .string()
    .min(10, 'Tiêu đề phải có ít nhất 10 ký tự')
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  content: z
    .string()
    .min(50, 'Nội dung phải có ít nhất 50 ký tự')
    .max(50000, 'Nội dung không được vượt quá 50,000 ký tự'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  postType: z.enum(['Discussion', 'Question', 'Announcement'], {
    required_error: 'Vui lòng chọn loại bài viết',
  }),
  tags: z.array(z.string()).min(1, 'Vui lòng thêm ít nhất 1 tag').max(5, 'Tối đa 5 tags'),
  status: z.enum(['Draft', 'Published', 'Archived']).optional(),
});

export type PostInput = z.infer<typeof postSchema>;

export const updatePostSchema = postSchema.partial();

export type UpdatePostInput = z.infer<typeof updatePostSchema>;

export const commentSchema = z.object({
  content: z
    .string()
    .min(10, 'Bình luận phải có ít nhất 10 ký tự')
    .max(5000, 'Bình luận không được vượt quá 5,000 ký tự'),
  postId: z.string().min(1),
  parentId: z.string().optional().nullable(),
});

export type CommentInput = z.infer<typeof commentSchema>;

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(10, 'Bình luận phải có ít nhất 10 ký tự')
    .max(5000, 'Bình luận không được vượt quá 5,000 ký tự'),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
