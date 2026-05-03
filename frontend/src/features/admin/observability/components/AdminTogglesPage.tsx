import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, ShieldAlert } from 'lucide-react'
import { useAdminLogsPage } from '../hooks/useAdminLogsPage'
import { EndpointToggleRow } from './EndpointToggleRow'
import type { EndpointToggleDto } from '../../types/admin.types'

export function AdminTogglesPage() {
  const { t, toggles, isTogglesLoading, isTogglesError, isSetToggleLoading, submitToggle } = useAdminLogsPage()
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const groupedToggles = useMemo(() => {
    const groups: Record<string, EndpointToggleDto[]> = {}
    for (const t of toggles) {
      // Typically keys are "UniHub.Forum.GetPosts" -> prefix is "UniHub.Forum"
      const parts = t.endpointKey.split('.')
      let prefix = 'Other'
      if (parts.length >= 2) {
        prefix = parts.slice(0, 2).join('.')
      }
      if (!groups[prefix]) groups[prefix] = []
      groups[prefix].push(t)
    }
    return groups
  }, [toggles])

  const toggleGroup = (prefix: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [prefix]: !prev[prefix],
    }))
  }

  if (isTogglesLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (isTogglesError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          <h3 className="font-semibold">{t('admin.togglesPage.messages.loadError')}</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-6 flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('admin.togglesPage.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('admin.togglesPage.subtitle')}</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-center border border-slate-200">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Enabled</p>
          <p className="text-xl font-bold text-slate-900">
            {toggles.filter((t) => t.isEnabled).length} <span className="text-sm font-normal text-slate-500">/ {toggles.length}</span>
          </p>
        </div>
      </header>

      <section className="space-y-4">
        {Object.entries(groupedToggles).map(([prefix, groupToggles]) => {
          const isExpanded = expandedGroups[prefix] !== false // Default open
          const enabledCount = groupToggles.filter((t) => t.isEnabled).length
          const totalCount = groupToggles.length
          const hasDisabled = enabledCount < totalCount

          return (
            <div key={prefix} className="overflow-hidden rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => toggleGroup(prefix)}
                className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                  <span className="font-semibold text-slate-700">{prefix}</span>
                  {hasDisabled && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Alerts
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full transition-all ${hasDisabled ? 'bg-amber-500' : 'bg-primary-600'}`}
                      style={{ width: `${(enabledCount / totalCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-500">
                    {enabledCount}/{totalCount}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-slate-100 bg-white">
                  {groupToggles.map((toggle) => (
                    <EndpointToggleRow
                      key={toggle.endpointKey}
                      toggle={toggle}
                      isSubmitting={isSetToggleLoading}
                      onSubmit={submitToggle}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {!toggles.length && (
          <div className="py-12 text-center text-sm text-slate-500">
            {t('admin.togglesPage.messages.empty')}
          </div>
        )}
      </section>
    </div>
  )
}
