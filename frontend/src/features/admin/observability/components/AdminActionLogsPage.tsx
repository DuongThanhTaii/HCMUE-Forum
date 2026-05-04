import type { UserActionLogsViewType } from '../../types/admin.types'
import { LogsFilterBar } from './LogsFilterBar'
import { useAdminLogsPage } from '../hooks/useAdminLogsPage'
import { useGetUsersQuery } from '../../api/admin.api'

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

  const { data: usersData } = useGetUsersQuery()
  const users = usersData ?? []

  const pageCount = Math.max(1, Math.ceil(actionTotal / actionPageSize))

  const exportJson = () => {
    const payload = JSON.stringify(actionItems, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `action-logs-${actionActorUserId || 'unknown'}-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyLine = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // no-op
    }
  }

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-semibold text-slate-900">{t('admin.actionLogsPage.title')}</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Auto-refresh: 5s</span>
            <button
              type="button"
              onClick={exportJson}
              disabled={!actionItems.length}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-700 disabled:opacity-50"
            >
              Export JSON
            </button>
          </div>
        </div>
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
          Search User
          <input
            list="users-list"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Select or type User ID..."
            value={actionActorUserId}
            onChange={(event) => setActionActorUserId(event.target.value)}
          />
          <datalist id="users-list">
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} ({u.email})
              </option>
            ))}
          </datalist>
        </label>
        <label className="text-sm font-medium text-slate-700">
          {t('admin.actionLogsPage.filters.method')}
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={actionMethod} onChange={(event) => setActionMethod(event.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {t('admin.actionLogsPage.filters.pathContains')}
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={actionPathContains} onChange={(event) => setActionPathContains(event.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {t('admin.actionLogsPage.filters.pageSize')}
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={actionPageSize} onChange={(event) => setActionPageSize(Number(event.target.value))}>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </LogsFilterBar>

      {!actionActorUserId ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Please search and select a user to view their action logs.
        </div>
      ) : isActionLogsLoading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-green-400 font-mono text-sm h-[500px] flex items-center justify-center">
          Loading terminal logs...
        </div>
      ) : isActionLogsError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {t('admin.actionLogsPage.messages.loadError')}
        </div>
      ) : (
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4 h-[500px] overflow-y-auto font-mono text-sm shadow-inner">
          <div className="text-green-500 mb-4 opacity-70">
            $ tail -f /var/log/users/{actionActorUserId}.log
          </div>
          {actionItems.length === 0 ? (
            <div className="text-slate-500 italic">No logs found for this user.</div>
          ) : (
            <div className="space-y-1">
              {actionItems.map((item) => {
                const isError = item.statusCode >= 400
                return (
                  <div key={item.id} className="flex gap-4 hover:bg-slate-800/50 px-2 py-1 rounded">
                    <span className="text-slate-500 shrink-0">
                      [{new Date(item.startedAtUtc).toISOString()}]
                    </span>
                    <span className="text-blue-400 font-bold w-12 shrink-0">{item.method}</span>
                    <span className="text-slate-300 flex-1 truncate" title={item.path}>
                      {item.path}
                    </span>
                    <span className={`w-12 shrink-0 font-bold ${isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {item.statusCode}
                    </span>
                    <span className="text-amber-300 w-16 shrink-0 text-right">{item.durationMs}ms</span>
                    <button
                      type="button"
                      className="w-14 shrink-0 rounded border border-slate-700 px-1 text-xs text-slate-300 hover:bg-slate-700"
                      onClick={() =>
                        void copyLine(
                          `[${new Date(item.startedAtUtc).toISOString()}] ${item.method} ${item.path} ${item.statusCode} ${item.durationMs}ms`,
                        )
                      }
                    >
                      Copy
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {actionActorUserId && !isActionLogsLoading && !isActionLogsError && (
        <div className="flex items-center justify-end gap-2 rounded-xl border border-slate-200 bg-white p-3">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setActionPage(Math.max(1, actionPage - 1))}
            disabled={actionPage <= 1}
          >
            {t('admin.actionLogsPage.pagination.previous')}
          </button>
          <p className="text-sm text-slate-600">
            {t('admin.actionLogsPage.pagination.page')} {actionPage} / {pageCount}
          </p>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setActionPage(Math.min(pageCount, actionPage + 1))}
            disabled={actionPage >= pageCount}
          >
            {t('admin.actionLogsPage.pagination.next')}
          </button>
        </div>
      )}
    </div>
  )
}

