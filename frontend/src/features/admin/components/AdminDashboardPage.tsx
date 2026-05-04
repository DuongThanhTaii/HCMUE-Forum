import { useGetRolesQuery, useGetUsersQuery } from '../api/admin.api'
import { useGetAuditLogsQuery, useGetTogglesQuery, useGetUserActionLogsQuery } from '../api/admin.observability.api'

export function AdminDashboardPage() {
  const { data: users = [] } = useGetUsersQuery()
  const { data: roles = [] } = useGetRolesQuery()
  const { data: toggles = [] } = useGetTogglesQuery()
  const { data: actions } = useGetUserActionLogsQuery({ page: 1, pageSize: 100, viewType: 'Administrator' })
  const { data: audits = [] } = useGetAuditLogsQuery({ take: 100 })

  const enabledToggles = toggles.filter((item) => item.isEnabled).length
  const actionItems = actions?.items ?? []
  const actionErrors = actionItems.filter((item) => item.statusCode >= 400).length
  const auditFailures = audits.filter((item) => !item.isSuccess).length
  const auditFailureRate = audits.length > 0 ? (auditFailures / audits.length) * 100 : 0
  const actionErrorRate = actionItems.length > 0 ? (actionErrors / actionItems.length) * 100 : 0

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-rose-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">Theo dõi nhanh người dùng, quyền truy cập và mức độ ổn định hệ thống.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Người dùng</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{users.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Vai trò</p>
          <p className="mt-1 text-2xl font-bold text-indigo-700">{roles.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Endpoint bật</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {enabledToggles} / {toggles.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Action logs (100 gần nhất)</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{actionItems.length}</p>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800">Tỷ lệ lỗi action logs</p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-amber-500" style={{ width: `${actionErrorRate}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-600">
            {actionErrors}/{actionItems.length || 0} yêu cầu trả về lỗi ({actionErrorRate.toFixed(1)}%)
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-800">Tỷ lệ thất bại audit logs</p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-rose-500" style={{ width: `${auditFailureRate}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-600">
            {auditFailures}/{audits.length || 0} sự kiện audit thất bại ({auditFailureRate.toFixed(1)}%)
          </p>
        </div>
      </div>
    </section>
  )
}

