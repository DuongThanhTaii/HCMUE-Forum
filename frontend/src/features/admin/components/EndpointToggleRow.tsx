import { useState } from 'react'
import type { EndpointToggleDto } from '../types/admin.types'

interface EndpointToggleRowProps {
  toggle: EndpointToggleDto
  isSubmitting: boolean
  onSubmit: (endpointKey: string, isEnabled: boolean, reason: string | null) => Promise<void>
}

export function EndpointToggleRow({ toggle, isSubmitting, onSubmit }: EndpointToggleRowProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isReasonInvalid, setIsReasonInvalid] = useState(false)

  const disableWithReason = async () => {
    const trimmedReason = reason.trim()
    if (!trimmedReason) {
      setIsReasonInvalid(true)
      return
    }
    await onSubmit(toggle.endpointKey, false, trimmedReason)
    setReason('')
    setIsReasonInvalid(false)
    setIsConfirmOpen(false)
  }

  const enableToggle = async () => {
    await onSubmit(toggle.endpointKey, true, null)
  }

  return (
    <article className="rounded-lg border border-slate-200 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900">{toggle.endpointKey}</p>
          <p className="text-xs text-slate-500">Version {toggle.version}</p>
        </div>
        {toggle.isEnabled ? (
          <button
            type="button"
            className="rounded-md border border-rose-300 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
            onClick={() => setIsConfirmOpen((value) => !value)}
            disabled={isSubmitting}
          >
            Disable
          </button>
        ) : (
          <button
            type="button"
            className="rounded-md border border-emerald-300 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50"
            onClick={() => void enableToggle()}
            disabled={isSubmitting}
          >
            Enable
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-500">Last reason: {toggle.reason || 'N/A'}</p>

      {toggle.isEnabled && isConfirmOpen ? (
        <div className="mt-3 space-y-2 rounded-md border border-rose-200 bg-rose-50 p-3">
          <label className="block text-sm font-medium text-rose-900" htmlFor={`disable-reason-${toggle.endpointKey}`}>
            Disable reason
          </label>
          <textarea
            id={`disable-reason-${toggle.endpointKey}`}
            className="w-full rounded-md border border-rose-300 px-3 py-2 text-sm"
            rows={2}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              if (event.target.value.trim()) setIsReasonInvalid(false)
            }}
          />
          {isReasonInvalid ? <p className="text-xs text-rose-700">Reason is required.</p> : null}
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
              onClick={() => void disableWithReason()}
              disabled={isSubmitting}
            >
              Confirm disable
            </button>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </article>
  )
}
