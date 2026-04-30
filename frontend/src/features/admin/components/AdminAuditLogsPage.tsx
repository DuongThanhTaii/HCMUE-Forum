import { LogsFilterBar } from './LogsFilterBar'
import { useAdminLogsPage } from '../hooks/useAdminLogsPage'

export function AdminAuditLogsPage() {
  const {
    t,
    auditLogs,
    isAuditLogsLoading,
    isAuditLogsError,
    auditUserId,
    setAuditUserId,
    auditEndpointKey,
    setAuditEndpointKey,
    auditResultFilter,
    setAuditResultFilter,
    auditTake,
    setAuditTake,
  } = useAdminLogsPage()

  if (isAuditLogsLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4">{t('common.loading')}</div>
  }

  if (isAuditLogsError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        {t('admin.auditLogsPage.messages.loadError', { defaultValue: 'Failed to load audit logs.' })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4">
        <h1 className="text-lg font-semibold text-slate-900">{t('admin.auditLogsPage.title', { defaultValue: 'Authorization audit logs' })}</h1>
      </header>

      <LogsFilterBar>
        <label className="text-sm font-medium text-slate-700">
          User ID
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={auditUserId} onChange={(event) => setAuditUserId(event.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Endpoint key
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={auditEndpointKey} onChange={(event) => setAuditEndpointKey(event.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Result
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={auditResultFilter}
            onChange={(event) => setAuditResultFilter(event.target.value as 'all' | 'success' | 'failure')}
          >
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Take
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={auditTake} onChange={(event) => setAuditTake(Number(event.target.value))}>
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Target</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Result</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.map((item) => (
              <tr key={item.auditLogId}>
                <td className="px-4 py-3 text-sm text-slate-700">{item.action}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.targetKey}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.isSuccess ? 'Success' : 'Failure'}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{new Date(item.occurredAtUtc).toLocaleString()}</td>
              </tr>
            ))}
            {!auditLogs.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  {t('admin.auditLogsPage.messages.empty', { defaultValue: 'No audit logs found.' })}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  )
}
