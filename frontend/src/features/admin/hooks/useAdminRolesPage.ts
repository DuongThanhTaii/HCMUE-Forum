import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAssignPermissionToRoleMutation,
  useCreateRoleMutation,
  useGetPermissionsQuery,
  useGetRolesQuery,
  useRemovePermissionFromRoleMutation,
} from '../api/admin.api'
import type { RoleDto } from '../types/admin.types'

type AssignedPermissionsByRole = Record<string, string[]>

export function useAdminRolesPage() {
  const { t } = useTranslation()
  const { data: rolesData, isLoading: isRolesLoading, isError: isRolesError } = useGetRolesQuery()
  const { data: permissionsData, isLoading: isPermissionsLoading, isError: isPermissionsError } = useGetPermissionsQuery()
  const [createRoleMutation, { isLoading: isCreatingRole }] = useCreateRoleMutation()
  const [assignPermissionMutation, { isLoading: isAssigningPermission }] = useAssignPermissionToRoleMutation()
  const [removePermissionMutation, { isLoading: isRemovingPermission }] = useRemovePermissionFromRoleMutation()

  const roles = useMemo(() => rolesData ?? [], [rolesData])
  const permissions = useMemo(() => permissionsData ?? [], [permissionsData])

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [assignedPermissionsByRole, setAssignedPermissionsByRole] = useState<AssignedPermissionsByRole>({})

  const effectiveSelectedRoleId = useMemo(() => {
    if (!roles.length) return null
    if (selectedRoleId && roles.some((role) => role.id === selectedRoleId)) return selectedRoleId
    return roles[0].id
  }, [roles, selectedRoleId])

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === effectiveSelectedRoleId) ?? null,
    [roles, effectiveSelectedRoleId],
  )

  const isPermissionAssigned = (roleId: string, permissionId: string) =>
    (assignedPermissionsByRole[roleId] ?? []).includes(permissionId)

  const togglePermission = async (permissionId: string) => {
    if (!effectiveSelectedRoleId) return

    const assigned = isPermissionAssigned(effectiveSelectedRoleId, permissionId)
    if (assigned) {
      await removePermissionMutation({
        roleId: effectiveSelectedRoleId,
        permissionId,
        scopeType: 'Global',
        scopeValue: null,
      }).unwrap()
      setAssignedPermissionsByRole((prev) => ({
        ...prev,
        [effectiveSelectedRoleId]: (prev[effectiveSelectedRoleId] ?? []).filter((id) => id !== permissionId),
      }))
      return
    }

    await assignPermissionMutation({
      roleId: effectiveSelectedRoleId,
      body: {
        permissionId,
        scopeType: 'Global',
        scopeValue: null,
      },
    }).unwrap()
    setAssignedPermissionsByRole((prev) => ({
      ...prev,
      [effectiveSelectedRoleId]: [...(prev[effectiveSelectedRoleId] ?? []), permissionId],
    }))
  }

  const selectRole = (roleId: string) => setSelectedRoleId(roleId)
  const openCreateModal = () => setIsCreateModalOpen(true)
  const closeCreateModal = () => setIsCreateModalOpen(false)

  const createRole = async (input: { name: string; description: string }) => {
    const createdRole: RoleDto = await createRoleMutation(input).unwrap()
    setSelectedRoleId(createdRole.id)
    setIsCreateModalOpen(false)
    setAssignedPermissionsByRole((prev) => ({ ...prev, [createdRole.id]: prev[createdRole.id] ?? [] }))
  }

  return {
    t,
    roles,
    permissions,
    selectedRoleId: effectiveSelectedRoleId,
    selectedRole,
    isLoading: isRolesLoading || isPermissionsLoading,
    isError: isRolesError || isPermissionsError,
    isCreateModalOpen,
    isCreatingRole,
    isAssigningPermission,
    isRemovingPermission,
    openCreateModal,
    closeCreateModal,
    selectRole,
    createRole,
    isPermissionAssigned,
    togglePermission,
  }
}
