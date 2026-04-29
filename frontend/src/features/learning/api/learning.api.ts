import { baseApi } from '@shared/lib/api/baseApi'
import type { LearningDocument, LearningSearchParams } from '@shared/types/learning'

type ApiEnvelope<T> = {
  data?: T
}

type SearchDocumentsPayload = {
  documents?: LearningDocument[]
  items?: LearningDocument[]
}

export const learningApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<LearningDocument[], LearningSearchParams | void>({
      query: (params) => ({
        url: '/api/v1/documents',
        params: {
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 20,
          searchTerm: params?.searchTerm,
        },
      }),
      transformResponse: (response: ApiEnvelope<SearchDocumentsPayload>) => {
        const payload = response?.data
        if (!payload) return []
        if (Array.isArray(payload.documents)) return payload.documents
        if (Array.isArray(payload.items)) return payload.items
        return []
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((doc) => ({ type: 'Document' as const, id: doc.id })),
              { type: 'Document' as const, id: 'LIST' },
            ]
          : [{ type: 'Document' as const, id: 'LIST' }],
    }),
  }),
})

export const { useGetDocumentsQuery } = learningApi

