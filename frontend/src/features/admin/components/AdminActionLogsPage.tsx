import type { UserActionLogsViewType } from '../types/admin.types'
import { LogsFilterBar } from './LogsFilterBar'
import { useAdminLogsPage } from '../hooks/useAdminLogsPage'

export function AdminActionLogsPage() {
  const {
    t,
    actionItems,
    actionPage,
    setActionPage,
    actionPageSize,
    setActionPageSize,
    actionTotal,
    actionViewType,
    setActionViewType,
    availableActionViewTypes,
    isActionLogsLoading,
    isActionLogsError,
    actionActorUserId,
    setActionActorUserId,
    actionMethod,
    setActionMethod,
    actionPathContains,
    setActionPathContains,
  } = useAdminLogsPage()

  if (isActionLogsLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4">{t('common.loading')}</div>
  }

  if (isActionLogsError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        {t('admin.actionLogsPage.messages.loadError', { defaultValue: 'Failed to load action logs.' })}
      </div>
    )
  }

  const pageCount = Math.max(1, Math.ceil(actionTotal / actionPageSize))

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4">
        <h1 className="text-lg font-semibold text-slate-900">{t('admin.actionLogsPage.title', { defaultValue: 'User action logs' })}</h1>
      </header>

      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
        {availableActionViewTypes.map((viewType) => (
          <button
            key={viewType}
            type="button"
            className={`rounded-md px-3 py-1.5 text-sm ${actionViewType === viewType ? 'bg-rose-100 text-rose-700' : 'text-slate-700'}`}
            onClick={() => setActionViewType(viewType as UserActionLogsViewType)}
          >
            {viewType}
          </button>
        ))}
      </div>

      <LogsFilterBar>
        <label className="text-sm font-medium text-slate-700">
          Actor user ID
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={actionActorUserId} onChange={(event) => setActionActorUserId(event.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Method
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={actionMethod} onChange={(event) => setActionMethod(event.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Path contains
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={actionPathContains} onChange={(event) => setActionPathContains(event.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Page size
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={actionPageSize} onChange={(event) => setActionPageSize(Number(event.target.value))}>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </LogsFilterBar>

      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Method</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Path</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Duration (ms)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {actionItems.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm text-slate-700">{item.method}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.path}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.statusCode}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.durationMs}</td>
              </tr>
            ))}
            {!actionItems.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  {t('admin.actionLogsPage.messages.empty', { defaultValue: 'No action logs found.' })}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <div className="flex items-center justify-end gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => setActionPage(Math.max(1, actionPage - 1))}
          disabled={actionPage <= 1}
        >
          Previous
        </button>
        <p className="text-sm text-slate-600">
          Page {actionPage} / {pageCount}
        </p>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => setActionPage(Math.min(pageCount, actionPage + 1))}
          disabled={actionPage >= pageCount}
        >
          Next
        </button>
      </div>
    </div>
  )
}
