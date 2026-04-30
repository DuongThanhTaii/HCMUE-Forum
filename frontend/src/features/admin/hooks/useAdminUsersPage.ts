import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAssignBadgeMutation,
  useAssignRoleToUserMutation,
  useGetRolesQuery,
  useGetUsersQuery,
  useRemoveBadgeMutation,
} from '../api/admin.api'
import type { AssignBadgeRequest, UserDto, UserStatus } from '../types/admin.types'

type FilterOption = { value: string; label: string }

type AssignRoleInput = { roleId: string }

export function useAdminUsersPage() {
  const { t } = useTranslation()
  const { data: usersData, isLoading: isUsersLoading, isError: isUsersError } = useGetUsersQuery()
  const { data: rolesData, isLoading: isRolesLoading, isError: isRolesError } = useGetRolesQuery()
  const [assignRoleToUser, { isLoading: isAssignRoleSubmitting }] = useAssignRoleToUserMutation()
  const [assignBadge, { isLoading: isAssignBadgeSubmitting }] = useAssignBadgeMutation()
  const [removeBadge] = useRemoveBadgeMutation()

  const [searchValue, setSearchValue] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all')
  const [assignRoleUserId, setAssignRoleUserId] = useState<string | null>(null)
  const [assignBadgeUserId, setAssignBadgeUserId] = useState<string | null>(null)

  const users = useMemo(() => usersData ?? [], [usersData])
  const roles = useMemo(() => rolesData ?? [], [rolesData])
  const normalizedSearch = searchValue.trim().toLowerCase()

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const bySearch =
          !normalizedSearch ||
          user.fullName.toLowerCase().includes(normalizedSearch) ||
          user.email.toLowerCase().includes(normalizedSearch)
        const byStatus = statusFilter === 'all' || user.status === statusFilter
        // Role membership is not included in A3 list payload yet.
        const byRole = roleFilter === 'all'
        return bySearch && byStatus && byRole
      }),
    [users, normalizedSearch, statusFilter, roleFilter],
  )

  const roleOptions: FilterOption[] = useMemo(
    () => [{ value: 'all', label: t('admin.usersPage.filters.allRoles') }, ...roles.map((r) => ({ value: r.id, label: r.name }))],
    [roles, t],
  )

  const statusOptions: FilterOption[] = useMemo(
    () => [
      { value: 'all', label: t('admin.usersPage.filters.allStatuses') },
      { value: 'Active', label: t('admin.usersPage.status.active') },
      { value: 'Inactive', label: t('admin.usersPage.status.inactive') },
      { value: 'Banned', label: t('admin.usersPage.status.banned') },
    ],
    [t],
  )

  const selectedUserForAssignRole = useMemo(
    () => users.find((user) => user.id === assignRoleUserId) ?? null,
    [users, assignRoleUserId],
  )
  const selectedUserForAssignBadge = useMemo(
    () => users.find((user) => user.id === assignBadgeUserId) ?? null,
    [users, assignBadgeUserId],
  )

  const openAssignRoleModal = (userId: string) => setAssignRoleUserId(userId)
  const closeAssignRoleModal = () => setAssignRoleUserId(null)
  const openAssignBadgeModal = (userId: string) => setAssignBadgeUserId(userId)
  const closeAssignBadgeModal = () => setAssignBadgeUserId(null)

  const submitAssignRole = async ({ roleId }: AssignRoleInput) => {
    if (!assignRoleUserId) return
    await assignRoleToUser({ userId: assignRoleUserId, body: { roleId } }).unwrap()
    setAssignRoleUserId(null)
  }

  const submitAssignBadge = async (input: AssignBadgeRequest) => {
    if (!assignBadgeUserId) return
    await assignBadge({ userId: assignBadgeUserId, body: input }).unwrap()
    setAssignBadgeUserId(null)
  }

  const removeUserBadge = async (userId: string) => {
    await removeBadge(userId).unwrap()
  }

  return {
    t,
    users: filteredUsers,
    roleOptions,
    statusOptions,
    searchValue,
    roleFilter,
    statusFilter,
    assignRoleUserId,
    assignBadgeUserId,
    selectedUserForAssignRole,
    selectedUserForAssignBadge,
    isAssignRoleSubmitting,
    isAssignBadgeSubmitting,
    isLoading: isUsersLoading || isRolesLoading,
    isError: isUsersError || isRolesError,
    setSearchValue,
    setRoleFilter,
    setStatusFilter: (value: string) => setStatusFilter(value as 'all' | UserStatus),
    openAssignRoleModal,
    closeAssignRoleModal,
    openAssignBadgeModal,
    closeAssignBadgeModal,
    submitAssignRole,
    submitAssignBadge,
    removeUserBadge,
  }
}

export type AdminUsersPageHook = ReturnType<typeof useAdminUsersPage>
export type AdminUsersPageUser = UserDto
