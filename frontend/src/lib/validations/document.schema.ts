import { z } from 'zod';

export const documentSchema = z.object({
  title: z
    .string()
    .min(10, 'Tiêu đề phải có ít nhất 10 ký tự')
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  description: z
    .string()
    .min(20, 'Mô tả phải có ít nhất 20 ký tự')
    .max(2000, 'Mô tả không được vượt quá 2000 ký tự'),
  documentType: z.enum(['Lecture', 'Assignment', 'Exam', 'Reference', 'Other'], {
    required_error: 'Vui lòng chọn loại tài liệu',
  }),
  courseId: z.string().min(1, 'Vui lòng chọn môn học'),
});

export type DocumentInput = z.infer<typeof documentSchema>;

export const ratingSchema = z.object({
  rating: z.number().min(1, 'Đánh giá tối thiểu 1 sao').max(5, 'Đánh giá tối đa 5 sao'),
  review: z.string().max(500, 'Nhận xét không được vượt quá 500 ký tự').optional(),
});

export type RatingInput = z.infer<typeof ratingSchema>;

export const courseSchema = z.object({
  name: z
    .string()
    .min(5, 'Tên môn học phải có ít nhất 5 ký tự')
    .max(200, 'Tên môn học không được vượt quá 200 ký tự'),
  code: z
    .string()
    .min(2, 'Mã môn học phải có ít nhất 2 ký tự')
    .max(20, 'Mã môn học không được vượt quá 20 ký tự'),
  description: z.string().max(1000, 'Mô tả không được vượt quá 1000 ký tự').optional(),
  facultyId: z.string().min(1, 'Vui lòng chọn khoa'),
  semester: z.string().min(1, 'Vui lòng chọn học kỳ'),
  credits: z.number().min(1, 'Số tín chỉ tối thiểu là 1').max(10, 'Số tín chỉ tối đa là 10'),
});

export type CourseInput = z.infer<typeof courseSchema>;

export const facultySchema = z.object({
  name: z
    .string()
    .min(5, 'Tên khoa phải có ít nhất 5 ký tự')
    .max(200, 'Tên khoa không được vượt quá 200 ký tự'),
  code: z
    .string()
    .min(2, 'Mã khoa phải có ít nhất 2 ký tự')
    .max(20, 'Mã khoa không được vượt quá 20 ký tự'),
  description: z.string().max(1000, 'Mô tả không được vượt quá 1000 ký tự').optional(),
});

export type FacultyInput = z.infer<typeof facultySchema>;

// File validation constants
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FILE_TYPE_EXTENSIONS: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};
