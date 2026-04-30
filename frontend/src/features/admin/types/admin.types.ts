export interface PermissionDto {
  id: string
  code: string
  name: string
  description: string
  module: string
  resource: string
  action: string
}

export interface RoleDto {
  id: string
  name: string
  description: string
  isDefault: boolean
  isSystemRole: boolean
  permissionCount: number
  createdAt: string
}

export interface RolePermissionAssignmentDto {
  permissionId?: string
  id?: string
  scopeType?: string
  scopeValue?: string | null
}

export interface RoleDetailDto extends RoleDto {
  permissions?: RolePermissionAssignmentDto[]
}

export interface CreateRoleRequest {
  name: string
  description: string
}

export interface UpdateRoleRequest {
  name: string
  description: string
}

export interface AssignPermissionRequest {
  permissionId: string
  scopeType: string
  scopeValue: string | null
}

export interface RemovePermissionRequest {
  roleId: string
  permissionId: string
  scopeType: string
  scopeValue: string | null
}

export interface BadgeDto {
  type: string
  name: string
  description: string
  emoji: string
}

export type UserStatus = 'Active' | 'Inactive' | 'Banned'

export interface UserDto {
  id: string
  email: string
  fullName: string
  bio: string | null
  status: UserStatus
  badge: BadgeDto | null
  createdAt: string
}

export interface AssignRoleToUserRequest {
  roleId: string
}

export interface AssignBadgeRequest {
  badgeType: string
  badgeName: string
  description: string
}
