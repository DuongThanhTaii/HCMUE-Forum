import type { PermissionDto, RoleDto } from '../../types/admin.types'

type RolePermissionGridProps = {
  permissions: PermissionDto[]
  selectedRole: RoleDto | null
  noRoleText: string
  isPermissionAssigned: (roleId: string, permissionId: string) => boolean
  onTogglePermission: (permissionId: string) => void | Promise<void>
  isBusy: boolean
}

export function RolePermissionGrid({
  permissions,
  selectedRole,
  noRoleText,
  isPermissionAssigned,
  onTogglePermission,
  isBusy,
}: RolePermissionGridProps) {
  if (!selectedRole) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        {noRoleText}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">{selectedRole.name}</h2>
      <p className="mt-1 text-sm text-slate-500">{selectedRole.description || '-'}</p>

      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
        {permissions.map((permission) => {
          const checked = isPermissionAssigned(selectedRole.id, permission.id)
          return (
            <label
              key={permission.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <div className="pr-3">
                <p className="font-medium text-slate-800">{permission.name}</p>
                <p className="text-xs text-slate-500">{permission.code}</p>
              </div>
              <input
                type="checkbox"
                checked={checked}
                disabled={isBusy}
                onChange={() => {
                  void onTogglePermission(permission.id)
                }}
                aria-label={permission.name}
              />
            </label>
          )
        })}
      </div>
    </div>
  )
}
