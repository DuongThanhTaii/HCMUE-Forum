import { baseApi } from '@shared/lib/api/baseApi'
import type {
  AssignBadgeRequest,
  AssignPermissionRequest,
  AssignRoleToUserRequest,
  CreateRoleRequest,
  PermissionDto,
  RemovePermissionRequest,
  RoleDetailDto,
  RoleDto,
  UserDto,
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

/** Backend expects empty string for "global" scope in query params. */
export function normalizeScopeValue(scopeValue: string | null): string {
  return scopeValue ?? ''
}

export function getUsersPath(): string {
  return '/api/v1/users'
}

export function getUserPath(id: string): string {
  return `/api/v1/users/${id}`
}

export function getAssignUserRolePath(userId: string): string {
  return `/api/v1/users/${userId}/roles`
}

export function getRemoveUserRolePath(userId: string, roleId: string): string {
  return `/api/v1/users/${userId}/roles/${roleId}`
}

export function getUserBadgePath(userId: string): string {
  return `/api/v1/users/${userId}/badge`
}

export function buildAssignRoleToUserRequest(userId: string, body: AssignRoleToUserRequest) {
  return {
    url: getAssignUserRolePath(userId),
    method: 'POST' as const,
    body,
  }
}

export function buildRemoveRoleFromUserRequest(userId: string, roleId: string) {
  return {
    url: getRemoveUserRolePath(userId, roleId),
    method: 'DELETE' as const,
  }
}

export function buildAssignBadgeRequest(userId: string, body: AssignBadgeRequest) {
  return {
    url: getUserBadgePath(userId),
    method: 'POST' as const,
    body,
  }
}

export function buildRemoveBadgeRequest(userId: string) {
  return {
    url: getUserBadgePath(userId),
    method: 'DELETE' as const,
  }
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
          scopeValue: normalizeScopeValue(scopeValue),
        },
      }),
      invalidatesTags: (_result, _error, { roleId }) => [{ type: 'Role', id: roleId }],
    }),

    getUsers: builder.query<UserDto[], void>({
      query: getUsersPath,
      transformResponse: (response: unknown) => unwrapApiList<UserDto>(response),
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((user) => ({ type: 'UserProfile' as const, id: user.id })),
              { type: 'UserProfile' as const, id: 'LIST' },
            ]
          : [{ type: 'UserProfile' as const, id: 'LIST' }],
    }),

    getUser: builder.query<UserDto, string>({
      query: getUserPath,
      transformResponse: (response: unknown) => {
        const user = unwrapApiData<UserDto>(response)
        if (!user) throw new Error('MISSING_USER')
        return user
      },
      providesTags: (_result, _err, id) => [{ type: 'UserProfile', id }],
    }),

    assignRoleToUser: builder.mutation<void, { userId: string; body: AssignRoleToUserRequest }>({
      query: ({ userId, body }) => buildAssignRoleToUserRequest(userId, body),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'UserProfile', id: userId },
        { type: 'UserProfile', id: 'LIST' },
      ],
    }),

    removeRoleFromUser: builder.mutation<void, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => buildRemoveRoleFromUserRequest(userId, roleId),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'UserProfile', id: userId },
        { type: 'UserProfile', id: 'LIST' },
      ],
    }),

    assignBadge: builder.mutation<void, { userId: string; body: AssignBadgeRequest }>({
      query: ({ userId, body }) => buildAssignBadgeRequest(userId, body),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'UserProfile', id: userId },
        { type: 'UserProfile', id: 'LIST' },
      ],
    }),

    removeBadge: builder.mutation<void, string>({
      query: (userId) => buildRemoveBadgeRequest(userId),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'UserProfile', id: userId },
        { type: 'UserProfile', id: 'LIST' },
      ],
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
  useGetUsersQuery,
  useGetUserQuery,
  useAssignRoleToUserMutation,
  useRemoveRoleFromUserMutation,
  useAssignBadgeMutation,
  useRemoveBadgeMutation,
} = adminApi
