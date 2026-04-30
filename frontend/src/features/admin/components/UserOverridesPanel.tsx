import { AddOverrideForm } from './AddOverrideForm'
import type { PermissionDto, PermissionOverrideDto, UserDto } from '../types/admin.types'

type SubmitOverrideInput = {
  permissionId: string
  scopeType: string
  scopeValue: string | null
  effect: 'Allow' | 'Deny'
  reason: string
  expiresAtUtc: string
}

type UserOverridesPanelProps = {
  searchValue: string
  onSearchValueChange: (value: string) => void
  users: UserDto[]
  selectedUserId: string | null
  onSelectUser: (userId: string) => void
  selectedUser: UserDto | null
  overrides: PermissionOverrideDto[]
  permissions: PermissionDto[]
  isLoading: boolean
  isMutating: boolean
  onSubmitOverride: (input: SubmitOverrideInput) => Promise<void>
  onRevokeOverride: (input: { permissionId: string; scopeType: string; scopeValue: string | null }) => Promise<void>
}

export function UserOverridesPanel({
  searchValue,
  onSearchValueChange,
  users,
  selectedUserId,
  onSelectUser,
  selectedUser,
  overrides,
  permissions,
  isLoading,
  isMutating,
  onSubmitOverride,
  onRevokeOverride,
}: UserOverridesPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm font-medium text-slate-700">
          Search user
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={searchValue}
            onChange={(event) => onSearchValueChange(event.target.value)}
            placeholder="Name or email"
          />
        </label>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              className={`w-full rounded-md border px-3 py-2 text-left ${
                selectedUserId === user.id ? 'border-rose-300 bg-rose-50' : 'border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => onSelectUser(user.id)}
            >
              <p className="text-sm font-medium text-slate-900">{user.fullName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </button>
          ))}
          {!users.length ? <p className="text-sm text-slate-500">No users found.</p> : null}
        </div>
      </section>

      <section className="space-y-4">
        {!selectedUser ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Select a user to manage overrides.</div>
        ) : (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold text-slate-900">{selectedUser.fullName}</h2>
              <p className="text-sm text-slate-500">{selectedUser.email}</p>
            </div>

            <AddOverrideForm permissions={permissions} isSubmitting={isMutating} onSubmit={onSubmitOverride} />

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Permission</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Scope</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Effect</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                        Loading...
                      </td>
                    </tr>
                  ) : null}
                  {!isLoading &&
                    overrides.map((override) => (
                      <tr key={override.overrideId}>
                        <td className="px-4 py-3 text-sm text-slate-700">{override.permissionCode}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {override.scopeType}
                          {override.scopeValue ? `:${override.scopeValue}` : ''}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{override.effect}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                            onClick={() =>
                              void onRevokeOverride({
                                permissionId: override.permissionId,
                                scopeType: override.scopeType,
                                scopeValue: override.scopeValue,
                              })
                            }
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  {!isLoading && !overrides.length ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                        No overrides.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
