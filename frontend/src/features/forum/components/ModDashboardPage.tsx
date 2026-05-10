import { useTranslation } from 'react-i18next'
import { useGetModerationPendingPostsQuery, useGetModerationReportsQuery } from '../api/forum.moderation.api'
import { useGetDocumentsQuery } from '@features/learning/api/learning.api'

const metricValueClass = 'mt-1 text-2xl font-semibold tabular-nums text-slate-900'

export function ModDashboardPage() {
  const { t } = useTranslation()
  const { data: pendingReports } = useGetModerationReportsQuery({ status: 'pending', pageNumber: 1, pageSize: 1 })
  const { data: keepReports } = useGetModerationReportsQuery({ status: 'resolved_keep', pageNumber: 1, pageSize: 1 })
  const { data: removeReports } = useGetModerationReportsQuery({ status: 'resolved_remove', pageNumber: 1, pageSize: 1 })
  const { data: pendingPosts = [] } = useGetModerationPendingPostsQuery({ pageNumber: 1, pageSize: 50 })
  const { data: pendingDocuments } = useGetDocumentsQuery({ pageNumber: 1, pageSize: 1, status: 2 })

  const pending = pendingReports?.totalCount ?? 0
  const kept = keepReports?.totalCount ?? 0
  const removed = removeReports?.totalCount ?? 0
  const docsPending = pendingDocuments?.totalCount ?? 0
  const totalResolved = kept + removed
  const totalAll = pending + totalResolved
  const pendingRate = totalAll > 0 ? (pending / totalAll) * 100 : 0
  const removedRate = totalResolved > 0 ? (removed / totalResolved) * 100 : 0

  return (
    <section className="space-y-4">
      <header className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t('mod.dashboard.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('mod.dashboard.subtitle')}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t('mod.dashboard.metrics.pendingReports')}
          </p>
          <p className={metricValueClass}>{pending}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t('mod.dashboard.metrics.pendingPosts')}
          </p>
          <p className={metricValueClass}>{pendingPosts.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t('mod.dashboard.metrics.pendingDocuments')}
          </p>
          <p className={metricValueClass}>{docsPending}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t('mod.dashboard.metrics.resolved')}
          </p>
          <p className={metricValueClass}>{totalResolved}</p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">{t('mod.dashboard.charts.backlogTitle')}</p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-slate-700" style={{ width: `${pendingRate}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-600">
            {t('mod.dashboard.charts.backlogHint', { pct: pendingRate.toFixed(1) })}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">{t('mod.dashboard.charts.removeRateTitle')}</p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-slate-500" style={{ width: `${removedRate}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-600">
            {t('mod.dashboard.charts.removeRateHint', { pct: removedRate.toFixed(1) })}
          </p>
        </div>
      </div>
    </section>
  )
}
