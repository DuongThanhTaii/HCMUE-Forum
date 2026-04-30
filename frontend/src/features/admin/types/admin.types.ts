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
