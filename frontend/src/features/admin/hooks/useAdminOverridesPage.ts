import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { skipToken } from '@reduxjs/toolkit/query'
import {
  useGetPermissionsQuery,
  useGetUserOverridesQuery,
  useGetUsersQuery,
  useRevokeUserOverrideMutation,
  useUpsertUserOverrideMutation,
} from '../api/admin.api'
import type { OverrideEffect, RevokePermissionOverrideRequest, UpsertPermissionOverrideRequest } from '../types/admin.types'

type OverrideTab = 'users' | 'groups'

export function useAdminOverridesPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<OverrideTab>('users')
  const [searchValue, setSearchValue] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const { data: usersData, isLoading: isUsersLoading, isError: isUsersError } = useGetUsersQuery()
  const { data: permissionsData, isLoading: isPermissionsLoading, isError: isPermissionsError } = useGetPermissionsQuery()
  const { data: overridesData, isLoading: isOverridesLoading, isError: isOverridesError } = useGetUserOverridesQuery(
    selectedUserId ?? skipToken,
  )
  const [upsertUserOverride, { isLoading: isUpserting }] = useUpsertUserOverrideMutation()
  const [revokeUserOverride, { isLoading: isRevoking }] = useRevokeUserOverrideMutation()

  const users = useMemo(() => usersData ?? [], [usersData])
  const permissions = useMemo(() => permissionsData ?? [], [permissionsData])
  const overrides = useMemo(() => overridesData ?? [], [overridesData])
  const normalizedSearch = searchValue.trim().toLowerCase()

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        if (!normalizedSearch) return true
        return user.fullName.toLowerCase().includes(normalizedSearch) || user.email.toLowerCase().includes(normalizedSearch)
      }),
    [users, normalizedSearch],
  )

  const selectedUser = useMemo(() => users.find((user) => user.id === selectedUserId) ?? null, [users, selectedUserId])

  const submitUserOverride = async (input: {
    permissionId: string
    scopeType: string
    scopeValue: string | null
    effect: OverrideEffect
    reason: string
    expiresAtUtc: string
  }) => {
    if (!selectedUserId) return
    const payload: UpsertPermissionOverrideRequest = {
      permissionId: input.permissionId,
      scopeType: input.scopeType,
      scopeValue: input.scopeValue || null,
      effect: input.effect,
      reason: input.reason.trim() || null,
      expiresAtUtc: input.expiresAtUtc.trim() || null,
    }
    await upsertUserOverride({ userId: selectedUserId, body: payload }).unwrap()
  }

  const revokeOverride = async (input: RevokePermissionOverrideRequest) => {
    if (!selectedUserId) return
    await revokeUserOverride({ userId: selectedUserId, query: input }).unwrap()
  }

  return {
    t,
    activeTab,
    setActiveTab,
    searchValue,
    setSearchValue,
    selectedUserId,
    setSelectedUserId,
    selectedUser,
    filteredUsers,
    permissions,
    overrides,
    isUsersLoading,
    isPermissionsLoading,
    isOverridesLoading,
    isLoading: isUsersLoading || isPermissionsLoading || (Boolean(selectedUserId) && isOverridesLoading),
    isError: isUsersError || isPermissionsError || isOverridesError,
    isMutating: isUpserting || isRevoking,
    submitUserOverride,
    revokeOverride,
    // Keep groups tab available while backend/group source is not wired yet.
    isGroupSourceAvailable: false,
  }
}
