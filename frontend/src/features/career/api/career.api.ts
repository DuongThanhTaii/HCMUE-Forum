import { baseApi } from '@shared/lib/api/baseApi'
import type { CareerJob, CareerSearchParams } from '@shared/types/career'

type ApiEnvelope<T> = {
  data?: T
}

type JobListPayload = {
  jobs?: CareerJob[]
  items?: CareerJob[]
  Items?: CareerJob[]
}

type RegisterCompanyRequest = {
  name: string
  description: string
  industry: number
  size: number
  email: string
  phone?: string
  address?: string
  registeredBy: string
  website?: string
  logoUrl?: string
  foundedYear?: number
  linkedIn?: string
  facebook?: string
}

type UploadCompanyLogoResponse = {
  url: string
}

function mapJob(raw: Record<string, unknown>): CareerJob {
  const salary = (raw.Salary ?? raw.salary ?? {}) as Record<string, unknown>
  return {
    id: String(raw.id ?? raw.jobPostingId ?? raw.JobPostingId ?? ''),
    title: String(raw.title ?? raw.Title ?? ''),
    description: (raw.description ?? raw.Description ?? null) as string | null,
    companyName: (raw.companyName ?? raw.CompanyName ?? null) as string | null,
    companyLogoUrl: (raw.companyLogoUrl ?? raw.CompanyLogoUrl ?? null) as string | null,
    city: (raw.city ?? raw.City ?? null) as string | null,
    isRemote: Boolean(raw.isRemote ?? raw.IsRemote ?? false),
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ''),
    salaryMin: Number(raw.salaryMin ?? raw.salaryMinAmount ?? salary.MinAmount ?? 0) || null,
    salaryMax: Number(raw.salaryMax ?? raw.salaryMaxAmount ?? salary.MaxAmount ?? 0) || null,
    currency: (raw.currency ?? salary.Currency ?? null) as string | null,
  }
}

export const careerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query<CareerJob[], CareerSearchParams | undefined>({
      query: (params = {}) => ({
        url: '/api/v1/jobs',
        params: {
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
          searchTerm: params.searchTerm,
          city: params.city,
        },
      }),
      transformResponse: (response: ApiEnvelope<JobListPayload>) => {
        const payload = response?.data
        if (!payload) return []
        const list = payload.jobs ?? payload.items ?? payload.Items
        if (Array.isArray(list)) {
          return list.map((item) => mapJob(item as Record<string, unknown>))
        }
        return []
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((job) => ({ type: 'Job' as const, id: job.id })),
              { type: 'Job' as const, id: 'LIST' },
            ]
          : [{ type: 'Job' as const, id: 'LIST' }],
    }),
    registerCompany: builder.mutation<unknown, RegisterCompanyRequest>({
      query: (body) => ({
        url: '/api/v1/companies',
        method: 'POST',
        body,
      }),
    }),
    uploadCompanyLogo: builder.mutation<UploadCompanyLogoResponse, File>({
      query: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return {
          url: '/api/v1/companies/logo/upload',
          method: 'POST',
          body: formData,
        }
      },
      transformResponse: (response: ApiEnvelope<UploadCompanyLogoResponse>) => {
        return response.data ?? { url: '' }
      },
    }),
  }),
})

export const { useGetJobsQuery, useRegisterCompanyMutation, useUploadCompanyLogoMutation } = careerApi

