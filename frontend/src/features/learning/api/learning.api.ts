import { baseApi } from '@shared/lib/api/baseApi'
import type {
  CourseListItem,
  DocumentDetail,
  DocumentsListResult,
  FacultyListItem,
  LearningDocument,
  LearningSearchParams,
} from '@shared/types/learning'

type ApiEnvelope<T> = {
  data?: T
  Data?: T
}

type SearchPayload = {
  documents?: LearningDocument[]
  Documents?: LearningDocument[]
  items?: LearningDocument[]
  totalCount?: number
  TotalCount?: number
  pageNumber?: number
  PageNumber?: number
  pageSize?: number
  PageSize?: number
  totalPages?: number
  TotalPages?: number
}

function extractDocuments(raw: unknown): LearningDocument[] {
  if (!raw || typeof raw !== 'object') return []
  const p = raw as SearchPayload
  const list = p.documents ?? p.Documents ?? p.items
  return Array.isArray(list) ? list : []
}

function unwrapData<T>(response: unknown): T | undefined {
  if (!response || typeof response !== 'object') return undefined
  const r = response as ApiEnvelope<T>
  return (r.data ?? r.Data) as T | undefined
}

function normalizeSearchResult(inner: unknown, pageFallback: number, pageSizeFallback: number): DocumentsListResult {
  if (Array.isArray(inner)) {
    return {
      documents: inner,
      totalCount: inner.length,
      pageNumber: pageFallback,
      pageSize: pageSizeFallback,
      totalPages: inner.length > 0 ? 1 : 0,
    }
  }
  if (!inner || typeof inner !== 'object') {
    return {
      documents: [],
      totalCount: 0,
      pageNumber: pageFallback,
      pageSize: pageSizeFallback,
      totalPages: 0,
    }
  }
  const p = inner as SearchPayload
  const documents = extractDocuments(inner)
  const totalCount = Number(p.totalCount ?? p.TotalCount ?? documents.length)
  const pageNumber = Number(p.pageNumber ?? p.PageNumber ?? pageFallback)
  const pageSize = Number(p.pageSize ?? p.PageSize ?? pageSizeFallback)
  let totalPages = Number(p.totalPages ?? p.TotalPages ?? 0)
  if (totalPages <= 0 && pageSize > 0) {
    totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  }
  return {
    documents,
    totalCount,
    pageNumber,
    pageSize,
    totalPages: totalCount === 0 ? 0 : totalPages,
  }
}

export const learningApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<DocumentsListResult, LearningSearchParams | void>({
      query: (params) => {
        const p = (params ?? {}) as LearningSearchParams
        const pageNumber = p.pageNumber ?? 1
        const pageSize = p.pageSize ?? 20
        return {
          url: '/api/v1/documents',
          params: {
            pageNumber,
            pageSize,
            ...(p.searchTerm ? { searchTerm: p.searchTerm } : {}),
            ...(p.facultyId ? { facultyId: p.facultyId } : {}),
            ...(p.courseId ? { courseId: p.courseId } : {}),
          },
        }
      },
      transformResponse: (response: unknown, _meta, arg) => {
        const p = (arg ?? {}) as LearningSearchParams
        const pageFallback = p.pageNumber ?? 1
        const pageSizeFallback = p.pageSize ?? 20
        const inner = unwrapData<SearchPayload | LearningDocument[]>(response)
        return normalizeSearchResult(inner, pageFallback, pageSizeFallback)
      },
      providesTags: (result) =>
        result?.documents?.length
          ? [
              ...result.documents.map((doc) => ({ type: 'Document' as const, id: doc.id })),
              { type: 'Document' as const, id: 'LIST' },
            ]
          : [{ type: 'Document' as const, id: 'LIST' }],
    }),

    getDocumentById: builder.query<DocumentDetail, string>({
      query: (id) => `/api/v1/documents/${id}`,
      transformResponse: (response: unknown) => {
        const raw = unwrapData<Record<string, unknown>>(response)
        if (!raw || typeof raw !== 'object') throw new Error('MISSING_DOCUMENT')
        const d = raw as DocumentDetail & Record<string, unknown>
        const pickStr = (a: string, b: string) => {
          const v = d[a] ?? d[b]
          return typeof v === 'string' && v.trim().length > 0 ? v : null
        }
        return {
          ...d,
          uploaderDisplayName: pickStr('uploaderDisplayName', 'UploaderDisplayName'),
          courseName: pickStr('courseName', 'CourseName'),
          reviewerDisplayName: pickStr('reviewerDisplayName', 'ReviewerDisplayName'),
        }
      },
      providesTags: (_result, _err, id) => [{ type: 'Document', id }],
    }),

    getFaculties: builder.query<FacultyListItem[], void>({
      query: () => '/api/v1/faculties',
      transformResponse: (response: unknown) => unwrapData<FacultyListItem[]>(response) ?? [],
    }),

    getCourses: builder.query<CourseListItem[], { facultyId?: string; semester?: string } | void>({
      query: (args) => {
        const a = (args ?? {}) as { facultyId?: string; semester?: string }
        return {
          url: '/api/v1/courses',
          params: {
            ...(a.facultyId ? { facultyId: a.facultyId } : {}),
            ...(a.semester ? { semester: a.semester } : {}),
          },
        }
      },
      transformResponse: (response: unknown) => unwrapData<CourseListItem[]>(response) ?? [],
    }),

    rateDocument: builder.mutation<
      unknown,
      { documentId: string; userId: string; rating: number }
    >({
      query: ({ documentId, userId, rating }) => ({
        url: `/api/v1/documents/${documentId}/rate`,
        method: 'POST',
        body: { userId, rating },
      }),
      invalidatesTags: (_r, _e, { documentId }) => [
        { type: 'Document', id: documentId },
        { type: 'Document', id: 'LIST' },
      ],
    }),

    downloadDocument: builder.mutation<unknown, { documentId: string; userId: string }>({
      query: ({ documentId, userId }) => ({
        url: `/api/v1/documents/${documentId}/download`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: (_r, _e, { documentId }) => [
        { type: 'Document', id: documentId },
        { type: 'Document', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetDocumentsQuery,
  useGetDocumentByIdQuery,
  useGetFacultiesQuery,
  useGetCoursesQuery,
  useRateDocumentMutation,
  useDownloadDocumentMutation,
} = learningApi
