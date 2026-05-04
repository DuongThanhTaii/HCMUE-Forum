import { useGetModerationPendingPostsQuery, useGetModerationReportsQuery } from '../api/forum.moderation.api'
import { useGetDocumentsQuery } from '@features/learning/api/learning.api'

export function ModDashboardPage() {
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
      <header className="rounded-xl border border-amber-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Mod Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">Tổng quan nhanh hàng đợi kiểm duyệt và chất lượng xử lý.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Báo cáo chờ xử lý</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{pending}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Bài chờ duyệt</p>
          <p className="mt-1 text-2xl font-bold text-indigo-700">{pendingPosts.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Tài liệu chờ duyệt</p>
          <p className="mt-1 text-2xl font-bold text-rose-700">{docsPending}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Đã xử lý</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{totalResolved}</p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800">Tỷ lệ tồn đọng báo cáo</p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-amber-500" style={{ width: `${pendingRate}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-600">{pendingRate.toFixed(1)}% báo cáo đang chờ xử lý</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800">Tỷ lệ xử lý gỡ bỏ</p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-rose-500" style={{ width: `${removedRate}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-600">{removedRate.toFixed(1)}% trong số báo cáo đã xử lý là gỡ bỏ</p>
        </div>
      </div>
    </section>
  )
}

