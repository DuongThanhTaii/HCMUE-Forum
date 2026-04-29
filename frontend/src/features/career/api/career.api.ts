import { baseApi } from '@shared/lib/api/baseApi'
import type { CareerJob, CareerSearchParams } from '@shared/types/career'

type ApiEnvelope<T> = {
  data?: T
}

type JobListPayload = {
  jobs?: CareerJob[]
  items?: CareerJob[]
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
        if (Array.isArray(payload.jobs)) return payload.jobs
        if (Array.isArray(payload.items)) return payload.items
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
  }),
})

export const { useGetJobsQuery } = careerApi

