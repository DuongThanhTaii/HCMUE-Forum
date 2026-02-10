export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  facultyId: string;
  faculty: Faculty;
  semester: string;
  credits: number;
  documentCount: number;
}

export interface Faculty {
  id: string;
  name: string;
  code: string;
  description?: string;
  courseCount: number;
  documentCount: number;
}

export type DocumentType = 'Lecture' | 'Assignment' | 'Exam' | 'Reference' | 'Other';
export type DocumentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Document {
  id: string;
  title: string;
  description: string;
  documentType: DocumentType;
  status: DocumentStatus;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  courseId: string;
  course: Course;
  uploaderId: string;
  uploader: User;
  averageRating: number;
  ratingCount: number;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedById?: string;
}

export interface DocumentRating {
  id: string;
  documentId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
}

export interface DocumentsQueryParams {
  courseId?: string;
  facultyId?: string;
  documentType?: DocumentType;
  status?: DocumentStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CoursesQueryParams {
  facultyId?: string;
  semester?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface UploadDocumentInput {
  title: string;
  description: string;
  documentType: DocumentType;
  courseId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface RateDocumentInput {
  rating: number;
  review?: string;
}

export interface CreateCourseInput {
  name: string;
  code: string;
  description?: string;
  facultyId: string;
  semester: string;
  credits: number;
}

export interface CreateFacultyInput {
  name: string;
  code: string;
  description?: string;
}
