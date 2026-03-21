// Career Module Types

export interface Company {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  createdAt: string;
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements: string;
  benefits?: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: 'FullTime' | 'PartTime' | 'Contract' | 'Internship' | 'Freelance';
  experienceLevel: 'Intern' | 'Fresher' | 'Junior' | 'Middle' | 'Senior' | 'Lead';
  status: 'Draft' | 'Published' | 'Closed' | 'Expired';
  deadline: string;
  company: Company;
  postedBy: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  isSaved: boolean;
  applicationsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Application {
  id: string;
  jobPosting: JobPosting;
  coverLetter: string;
  cvUrl: string;
  status: 'Pending' | 'Reviewing' | 'Interviewed' | 'Offered' | 'Rejected' | 'Withdrawn';
  appliedAt: string;
  updatedAt: string;
  notes?: string;
}

export interface PaginatedJobs {
  items: JobPosting[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedApplications {
  items: Application[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface JobFilters {
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  companyId?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateJobDto {
  title: string;
  description: string;
  requirements: string;
  benefits?: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: string;
  experienceLevel: string;
  deadline: string;
  companyId: string;
}

export interface UpdateJobDto extends Partial<CreateJobDto> {}

export interface CreateApplicationDto {
  jobPostingId: string;
  coverLetter: string;
  cv: File;
}

export interface UpdateApplicationStatusDto {
  status: string;
  notes?: string;
}

export interface CreateCompanyDto {
  name: string;
  description: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  logo?: File;
}
