import { apiClient } from './client';
import type {
  JobPosting,
  PaginatedJobs,
  JobFilters,
  CreateJobDto,
  UpdateJobDto,
  Application,
  PaginatedApplications,
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  Company,
  CreateCompanyDto,
} from '@/types/api/career.types';

// ============================================
// JOB POSTINGS
// ============================================

export async function getJobs(filters: JobFilters): Promise<PaginatedJobs> {
  const params = new URLSearchParams();
  if (filters.location) params.append('location', filters.location);
  if (filters.jobType) params.append('jobType', filters.jobType);
  if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
  if (filters.salaryMin) params.append('salaryMin', filters.salaryMin.toString());
  if (filters.salaryMax) params.append('salaryMax', filters.salaryMax.toString());
  if (filters.companyId) params.append('companyId', filters.companyId);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

  const { data } = await apiClient.get<PaginatedJobs>(`/jobs?${params.toString()}`);
  return data;
}

export async function searchJobs(query: string, filters: JobFilters): Promise<PaginatedJobs> {
  const params = new URLSearchParams({ q: query });
  if (filters.location) params.append('location', filters.location);
  if (filters.jobType) params.append('jobType', filters.jobType);
  if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
  if (filters.page) params.append('page', filters.page.toString());

  const { data } = await apiClient.get<PaginatedJobs>(`/jobs/search?${params.toString()}`);
  return data;
}

export async function getJob(id: string): Promise<JobPosting> {
  const { data } = await apiClient.get<JobPosting>(`/jobs/${id}`);
  return data;
}

export async function createJob(jobData: CreateJobDto): Promise<JobPosting> {
  const { data } = await apiClient.post<JobPosting>('/jobs', jobData);
  return data;
}

export async function updateJob(id: string, jobData: UpdateJobDto): Promise<JobPosting> {
  const { data } = await apiClient.put<JobPosting>(`/jobs/${id}`, jobData);
  return data;
}

export async function publishJob(id: string): Promise<void> {
  await apiClient.post(`/jobs/${id}/publish`);
}

export async function closeJob(id: string): Promise<void> {
  await apiClient.post(`/jobs/${id}/close`);
}

export async function deleteJob(id: string): Promise<void> {
  await apiClient.delete(`/jobs/${id}`);
}

export async function saveJob(id: string): Promise<void> {
  await apiClient.post(`/jobs/${id}/save`);
}

export async function unsaveJob(id: string): Promise<void> {
  await apiClient.delete(`/jobs/${id}/save`);
}

export async function getSavedJobs(page = 1, pageSize = 20): Promise<PaginatedJobs> {
  const { data } = await apiClient.get<PaginatedJobs>(`/jobs/saved?page=${page}&pageSize=${pageSize}`);
  return data;
}

// ============================================
// APPLICATIONS
// ============================================

export async function submitApplication(applicationData: CreateApplicationDto): Promise<Application> {
  const formData = new FormData();
  formData.append('jobPostingId', applicationData.jobPostingId);
  formData.append('coverLetter', applicationData.coverLetter);
  formData.append('cv', applicationData.cv);

  const { data } = await apiClient.post<Application>('/applications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

export async function getMyApplications(page = 1, pageSize = 20): Promise<PaginatedApplications> {
  const { data } = await apiClient.get<PaginatedApplications>(`/applications?page=${page}&pageSize=${pageSize}`);
  return data;
}

export async function getApplication(id: string): Promise<Application> {
  const { data } = await apiClient.get<Application>(`/applications/${id}`);
  return data;
}

export async function updateApplicationStatus(
  id: string,
  statusData: UpdateApplicationStatusDto
): Promise<Application> {
  const { data } = await apiClient.put<Application>(`/applications/${id}/status`, statusData);
  return data;
}

export async function withdrawApplication(id: string): Promise<void> {
  await apiClient.post(`/applications/${id}/withdraw`);
}

// ============================================
// COMPANIES
// ============================================

export async function getCompany(id: string): Promise<Company> {
  const { data } = await apiClient.get<Company>(`/companies/${id}`);
  return data;
}

export async function getCompanyJobs(id: string, page = 1, pageSize = 20): Promise<PaginatedJobs> {
  const { data } = await apiClient.get<PaginatedJobs>(`/companies/${id}/jobs?page=${page}&pageSize=${pageSize}`);
  return data;
}

export async function createCompany(companyData: CreateCompanyDto): Promise<Company> {
  const formData = new FormData();
  formData.append('name', companyData.name);
  formData.append('description', companyData.description);
  if (companyData.website) formData.append('website', companyData.website);
  if (companyData.industry) formData.append('industry', companyData.industry);
  if (companyData.size) formData.append('size', companyData.size);
  if (companyData.location) formData.append('location', companyData.location);
  if (companyData.logo) formData.append('logo', companyData.logo);

  const { data } = await apiClient.post<Company>('/companies', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

export async function getCompanies(page = 1, pageSize = 20): Promise<{ items: Company[]; totalCount: number }> {
  const { data } = await apiClient.get(`/companies?page=${page}&pageSize=${pageSize}`);
  return data;
}
