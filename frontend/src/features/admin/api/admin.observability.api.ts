import { baseApi } from '@shared/lib/api/baseApi'
import type {
  AuditLogDto,
  AuditLogsFilterParams,
  EndpointToggleDto,
  SetEndpointToggleRequest,
  UserActionLogsFilterParams,
  UserActionLogsResponse,
} from '../types/admin.types'
import { unwrapApiData, unwrapApiList } from './admin.api'

type QueryPrimitive = string | number | boolean
type QueryParams = Record<string, QueryPrimitive>

function compactParams(input: Record<string, QueryPrimitive | undefined>): QueryParams {
  const entries = Object.entries(input).filter(([, value]) => value !== undefined) as [string, QueryPrimitive][]
  return Object.fromEntries(entries)
}

export function getTogglesPath(): string {
  return '/api/v1/admin/authorization/toggles'
}

export function getTogglePath(endpointKey: string): string {
  return `${getTogglesPath()}/${endpointKey}`
}

export function buildSetToggleRequest(endpointKey: string, body: SetEndpointToggleRequest) {
  return {
    url: getTogglePath(endpointKey),
    method: 'PUT' as const,
    body,
  }
}

export function getAuditLogsPath(): string {
  return '/api/v1/admin/authorization/audit-logs'
}

export function buildAuditLogsParams(params: AuditLogsFilterParams): QueryParams {
  return compactParams({
    userId: params.userId,
    endpointKey: params.endpointKey,
    isSuccess: params.isSuccess,
    fromUtc: params.fromUtc,
    toUtc: params.toUtc,
    take: params.take,
  })
}

export function getUserActionLogsPath(): string {
  return '/api/v1/admin/observability/user-actions'
}

export function buildUserActionLogsParams(params: UserActionLogsFilterParams): QueryParams {
  return compactParams({
    actorUserId: params.actorUserId,
    correlationId: params.correlationId,
    traceId: params.traceId,
    method: params.method,
    pathContains: params.pathContains,
    minStatusCode: params.minStatusCode,
    maxStatusCode: params.maxStatusCode,
    fromUtc: params.fromUtc,
    toUtc: params.toUtc,
    viewType: params.viewType,
    page: params.page,
    pageSize: params.pageSize,
  })
}

export const adminObservabilityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getToggles: builder.query<EndpointToggleDto[], void>({
      query: () => getTogglesPath(),
      transformResponse: (response: unknown) => unwrapApiList<EndpointToggleDto>(response),
    }),

    getToggle: builder.query<EndpointToggleDto, string>({
      query: (endpointKey) => getTogglePath(endpointKey),
      transformResponse: (response: unknown) => {
        const toggle = unwrapApiData<EndpointToggleDto>(response)
        if (!toggle) throw new Error('MISSING_TOGGLE')
        return toggle
      },
    }),

    setToggle: builder.mutation<EndpointToggleDto, { endpointKey: string; body: SetEndpointToggleRequest }>({
      query: ({ endpointKey, body }) => buildSetToggleRequest(endpointKey, body),
      transformResponse: (response: unknown) => {
        const toggle = unwrapApiData<EndpointToggleDto>(response)
        if (!toggle) throw new Error('MISSING_TOGGLE')
        return toggle
      },
    }),

    getAuditLogs: builder.query<AuditLogDto[], AuditLogsFilterParams | void>({
      query: (params) => ({
        url: getAuditLogsPath(),
        params: buildAuditLogsParams(params ?? {}),
      }),
      transformResponse: (response: unknown) => unwrapApiList<AuditLogDto>(response),
    }),

    getUserActionLogs: builder.query<UserActionLogsResponse, UserActionLogsFilterParams | void>({
      query: (params) => ({
        url: getUserActionLogsPath(),
        params: buildUserActionLogsParams(params ?? {}),
      }),
      transformResponse: (response: unknown) => {
        const payload = unwrapApiData<UserActionLogsResponse>(response)
        if (!payload) throw new Error('MISSING_USER_ACTION_LOGS')
        return payload
      },
    }),
  }),
})

export const {
  useGetTogglesQuery,
  useGetToggleQuery,
  useSetToggleMutation,
  useGetAuditLogsQuery,
  useGetUserActionLogsQuery,
} = adminObservabilityApi
