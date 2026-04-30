import { useState, type FormEvent } from 'react'
import type { OverrideEffect, PermissionDto } from '../types/admin.types'

type AddOverrideFormProps = {
  permissions: PermissionDto[]
  isSubmitting: boolean
  onSubmit: (input: {
    permissionId: string
    scopeType: string
    scopeValue: string | null
    effect: OverrideEffect
    reason: string
    expiresAtUtc: string
  }) => Promise<void>
}

export function AddOverrideForm({ permissions, isSubmitting, onSubmit }: AddOverrideFormProps) {
  const [permissionId, setPermissionId] = useState('')
  const [scopeType, setScopeType] = useState('Global')
  const [scopeValue, setScopeValue] = useState('')
  const [effect, setEffect] = useState<OverrideEffect>('Deny')
  const [reason, setReason] = useState('')
  const [expiresAtUtc, setExpiresAtUtc] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!permissionId) return
    await onSubmit({
      permissionId,
      scopeType,
      scopeValue: scopeType === 'Global' ? null : scopeValue,
      effect,
      reason,
      expiresAtUtc,
    })
    setReason('')
    setExpiresAtUtc('')
  }

  return (
    <form className="space-y-3 rounded-xl border border-slate-200 bg-white p-4" onSubmit={(event) => void submit(event)}>
      <h3 className="text-sm font-semibold text-slate-900">Add override</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Permission
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={permissionId}
            onChange={(event) => setPermissionId(event.target.value)}
            required
          >
            <option value="">Select permission</option>
            {permissions.map((permission) => (
              <option key={permission.id} value={permission.id}>
                {permission.code}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Effect
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={effect}
            onChange={(event) => setEffect(event.target.value as OverrideEffect)}
          >
            <option value="Allow">Allow</option>
            <option value="Deny">Deny</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Scope type
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={scopeType}
            onChange={(event) => setScopeType(event.target.value)}
          >
            <option value="Global">Global</option>
            <option value="Faculty">Faculty</option>
            <option value="Course">Course</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Scope value
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={scopeValue}
            onChange={(event) => setScopeValue(event.target.value)}
            disabled={scopeType === 'Global'}
            placeholder={scopeType === 'Global' ? '(empty for Global)' : 'e.g. faculty:it'}
          />
        </label>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Reason
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Optional reason"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Expires at (UTC ISO)
        <input
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={expiresAtUtc}
          onChange={(event) => setExpiresAtUtc(event.target.value)}
          placeholder="2026-12-31T23:59:59Z"
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting || !permissionId}
      >
        Add override
      </button>
    </form>
  )
}
