type GroupOverridesPanelProps = {
  isGroupSourceAvailable: boolean
}

export function GroupOverridesPanel({ isGroupSourceAvailable }: GroupOverridesPanelProps) {
  if (isGroupSourceAvailable) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Group overrides source is available, but UI wiring is intentionally deferred in Task 7.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      Group override source is currently unavailable. User override workflow remains fully operational.
    </div>
  )
}
