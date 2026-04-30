import type { RoleDto } from '../../types/admin.types'

type RoleListProps = {
  roles: RoleDto[]
  selectedRoleId: string | null
  onSelectRole: (roleId: string) => void
}

export function RoleList({ roles, selectedRoleId, onSelectRole }: RoleListProps) {
  return (
    <div className="space-y-2">
      {roles.map((role) => {
        const isSelected = role.id === selectedRoleId
        return (
          <button
            key={role.id}
            type="button"
            className={`w-full rounded-lg border px-3 py-2 text-left transition ${
              isSelected
                ? 'border-rose-300 bg-rose-50 text-rose-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => onSelectRole(role.id)}
          >
            <p className="text-sm font-semibold">{role.name}</p>
            <p className="mt-1 text-xs text-slate-500">{role.description || '-'}</p>
          </button>
        )
      })}
    </div>
  )
}
