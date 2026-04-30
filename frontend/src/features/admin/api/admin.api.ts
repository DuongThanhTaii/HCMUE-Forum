import { baseApi } from '@shared/lib/api/baseApi'
import type {
  AssignPermissionRequest,
  CreateRoleRequest,
  PermissionDto,
  RemovePermissionRequest,
  RoleDetailDto,
  RoleDto,
  UpdateRoleRequest,
} from '../types/admin.types'

/** Supports `{ data }` / `{ Data }` envelopes and raw arrays from older responses */
export function unwrapApiData<T>(response: unknown): T | undefined {
  if (response === null || response === undefined) return undefined
  if (typeof response !== 'object') return undefined
  const r = response as Record<string, unknown>
  if ('data' in r && r.data !== undefined) return r.data as T
  if ('Data' in r && r.Data !== undefined) return r.Data as T
  return undefined
}

export function unwrapApiList<T>(response: unknown): T[] {
  const inner = unwrapApiData<T[]>(response)
  if (Array.isArray(inner)) return inner
  if (Array.isArray(response)) return response as T[]
  return []
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPermissions: builder.query<PermissionDto[], void>({
      query: () => '/api/v1/permissions',
      transformResponse: (response: unknown) => unwrapApiList<PermissionDto>(response),
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((p) => ({ type: 'Permission' as const, id: p.id })),
              { type: 'Permission' as const, id: 'LIST' },
            ]
          : [{ type: 'Permission' as const, id: 'LIST' }],
    }),

    getPermission: builder.query<PermissionDto, string>({
      query: (id) => `/api/v1/permissions/${id}`,
      transformResponse: (response: unknown) => {
        const p = unwrapApiData<PermissionDto>(response)
        if (!p) throw new Error('MISSING_PERMISSION')
        return p
      },
      providesTags: (_result, _err, id) => [{ type: 'Permission', id }],
    }),

    getRoles: builder.query<RoleDto[], void>({
      query: () => '/api/v1/roles',
      transformResponse: (response: unknown) => unwrapApiList<RoleDto>(response),
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((role) => ({ type: 'Role' as const, id: role.id })),
              { type: 'Role' as const, id: 'LIST' },
            ]
          : [{ type: 'Role' as const, id: 'LIST' }],
    }),

    getRole: builder.query<RoleDetailDto, string>({
      query: (id) => `/api/v1/roles/${id}`,
      transformResponse: (response: unknown) => {
        const r = unwrapApiData<RoleDetailDto>(response)
        if (!r) throw new Error('MISSING_ROLE')
        return r
      },
      providesTags: (_result, _err, id) => [{ type: 'Role', id }],
    }),

    createRole: builder.mutation<RoleDto, CreateRoleRequest>({
      query: (body) => ({
        url: '/api/v1/roles',
        method: 'POST',
        body,
      }),
      transformResponse: (response: unknown) => {
        const r = unwrapApiData<RoleDto>(response)
        if (!r) throw new Error('MISSING_ROLE')
        return r
      },
      invalidatesTags: ['Role'],
    }),

    updateRole: builder.mutation<unknown, { id: string; body: UpdateRoleRequest }>({
      query: ({ id, body }) => ({
        url: `/api/v1/roles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Role'],
    }),

    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),

    assignPermissionToRole: builder.mutation<void, { roleId: string; body: AssignPermissionRequest }>({
      query: ({ roleId, body }) => ({
        url: `/api/v1/roles/${roleId}/permissions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { roleId }) => [{ type: 'Role', id: roleId }],
    }),

    removePermissionFromRole: builder.mutation<void, RemovePermissionRequest>({
      query: ({ roleId, permissionId, scopeType, scopeValue }) => ({
        url: `/api/v1/roles/${roleId}/permissions/${permissionId}`,
        method: 'DELETE',
        params: {
          scopeType,
          scopeValue,
        },
      }),
      invalidatesTags: (_result, _error, { roleId }) => [{ type: 'Role', id: roleId }],
    }),
  }),
})

export const {
  useGetPermissionsQuery,
  useGetPermissionQuery,
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignPermissionToRoleMutation,
  useRemovePermissionFromRoleMutation,
} = adminApi
