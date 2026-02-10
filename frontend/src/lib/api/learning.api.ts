import { apiClient } from './client';
import type {
  Document,
  DocumentRating,
  Course,
  Faculty,
  DocumentsQueryParams,
  CoursesQueryParams,
  PaginatedResponse,
  UploadDocumentInput,
  RateDocumentInput,
  CreateCourseInput,
  CreateFacultyInput,
} from '@/types/api/learning.types';

const BASE_URL = '/api/v1';

export const learningApi = {
  // Documents
  getDocuments: async (params: DocumentsQueryParams = {}): Promise<PaginatedResponse<Document>> => {
    const response = await apiClient.get(`${BASE_URL}/documents`, { params });
    return response.data;
  },

  getDocument: async (id: string): Promise<Document> => {
    const response = await apiClient.get(`${BASE_URL}/documents/${id}`);
    return response.data;
  },

  uploadDocument: async (data: UploadDocumentInput): Promise<Document> => {
    const response = await apiClient.post(`${BASE_URL}/documents/upload`, data);
    return response.data;
  },

  rateDocument: async (id: string, data: RateDocumentInput): Promise<DocumentRating> => {
    const response = await apiClient.post(`${BASE_URL}/documents/${id}/rate`, data);
    return response.data;
  },

  downloadDocument: async (id: string): Promise<void> => {
    await apiClient.post(`${BASE_URL}/documents/${id}/download`);
  },

  approveDocument: async (id: string): Promise<Document> => {
    const response = await apiClient.post(`${BASE_URL}/documents/${id}/approve`);
    return response.data;
  },

  rejectDocument: async (id: string, reason?: string): Promise<Document> => {
    const response = await apiClient.post(`${BASE_URL}/documents/${id}/reject`, { reason });
    return response.data;
  },

  getApprovalQueue: async (): Promise<Document[]> => {
    const response = await apiClient.get(`${BASE_URL}/documents`, {
      params: { status: 'Pending' },
    });
    return response.data.items;
  },

  // Courses
  getCourses: async (params: CoursesQueryParams = {}): Promise<PaginatedResponse<Course>> => {
    const response = await apiClient.get(`${BASE_URL}/courses`, { params });
    return response.data;
  },

  getCourse: async (id: string): Promise<Course> => {
    const response = await apiClient.get(`${BASE_URL}/courses/${id}`);
    return response.data;
  },

  createCourse: async (data: CreateCourseInput): Promise<Course> => {
    const response = await apiClient.post(`${BASE_URL}/courses`, data);
    return response.data;
  },

  // Faculties
  getFaculties: async (): Promise<Faculty[]> => {
    const response = await apiClient.get(`${BASE_URL}/faculties`);
    return response.data;
  },

  getFaculty: async (id: string): Promise<Faculty> => {
    const response = await apiClient.get(`${BASE_URL}/faculties/${id}`);
    return response.data;
  },

  createFaculty: async (data: CreateFacultyInput): Promise<Faculty> => {
    const response = await apiClient.post(`${BASE_URL}/faculties`, data);
    return response.data;
  },
};
