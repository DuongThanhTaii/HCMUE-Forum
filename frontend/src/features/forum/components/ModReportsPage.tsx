import { useModReportsPage } from '../hooks/useModReportsPage'

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

export function ModReportsPage() {
  const { t, status, setStatus, tabs, reports, totalCount, isLoading, isError, isResolving, feedback, onResolve } =
    useModReportsPage()

  if (isLoading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">{t('common.loading')}</div>
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {t('forum.mod.feedback.loadFailed')}
      </div>
    )
  }

  return (
    <section className="space-y-3">
      <header className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">{t('forum.mod.reportsTitle')}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {t('forum.mod.totalReports')}: <span className="font-semibold">{totalCount}</span>
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatus(tab.id)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
              status === tab.id
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {feedback ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{feedback}</div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full table-auto text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">{t('forum.mod.columns.type')}</th>
              <th className="px-3 py-2">{t('forum.mod.columns.reason')}</th>
              <th className="px-3 py-2">{t('forum.mod.columns.preview')}</th>
              <th className="px-3 py-2">{t('forum.mod.columns.createdAt')}</th>
              <th className="px-3 py-2">{t('forum.mod.columns.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-3 py-2">{report.reportedItemType === 1 ? 'Post' : 'Comment'}</td>
                <td className="px-3 py-2">{report.reason}</td>
                <td className="px-3 py-2 text-slate-600">
                  {report.isTargetDeleted
                    ? t('forum.mod.targetDeleted')
                    : report.titlePreview ?? report.contentPreview ?? t('common.noData')}
                </td>
                <td className="px-3 py-2 text-slate-500">{formatTime(report.createdAt)}</td>
                <td className="px-3 py-2">
                  {status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isResolving}
                        onClick={() => void onResolve(report.id, 'keep')}
                        className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary disabled:opacity-60"
                      >
                        {t('forum.mod.actions.keep')}
                      </button>
                      <button
                        type="button"
                        disabled={isResolving}
                        onClick={() => void onResolve(report.id, 'remove')}
                        className="rounded border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                      >
                        {t('forum.mod.actions.remove')}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">
                  {t('forum.mod.noReports')}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
