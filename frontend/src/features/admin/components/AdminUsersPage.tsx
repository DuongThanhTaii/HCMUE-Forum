import { AssignBadgeModal } from './AssignBadgeModal'
import { AssignRoleModal } from './AssignRoleModal'
import { useAdminUsersPage } from '../hooks/useAdminUsersPage'

export function AdminUsersPage() {
  const {
    t,
    users,
    roleOptions,
    statusOptions,
    searchValue,
    roleFilter,
    statusFilter,
    assignRoleUserId,
    assignBadgeUserId,
    selectedUserForAssignRole,
    isAssignRoleSubmitting,
    isAssignBadgeSubmitting,
    isLoading,
    isError,
    setSearchValue,
    setRoleFilter,
    setStatusFilter,
    openAssignRoleModal,
    closeAssignRoleModal,
    openAssignBadgeModal,
    closeAssignBadgeModal,
    submitAssignRole,
    submitAssignBadge,
    removeUserBadge,
  } = useAdminUsersPage()

  if (isLoading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4">{t('common.loading')}</div>
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
        {t('admin.usersPage.messages.loadError')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4">
        <h1 className="text-lg font-semibold text-slate-900">{t('admin.usersPage.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('admin.usersPage.subtitle')}</p>
      </header>

      <section className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">
          {t('admin.usersPage.filters.search')}
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t('admin.usersPage.filters.searchPlaceholder')}
            aria-label={t('admin.usersPage.filters.search')}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          {t('admin.usersPage.filters.role')}
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label={t('admin.usersPage.filters.role')}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          {t('admin.usersPage.filters.status')}
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label={t('admin.usersPage.filters.status')}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('admin.usersPage.table.user')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('admin.usersPage.table.status')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('admin.usersPage.table.badge')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('admin.usersPage.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{user.fullName}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{t(`admin.usersPage.status.${user.status.toLowerCase()}`)}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {user.badge ? `${user.badge.emoji} ${user.badge.name}` : t('admin.usersPage.badge.none')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => openAssignRoleModal(user.id)}
                    >
                      {t('admin.usersPage.actions.assignRole')}
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => openAssignBadgeModal(user.id)}
                    >
                      {t('admin.usersPage.actions.assignBadge')}
                    </button>
                    {user.badge ? (
                      <button
                        type="button"
                        className="rounded-md border border-rose-300 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-50"
                        onClick={() => void removeUserBadge(user.id)}
                      >
                        {t('admin.usersPage.actions.removeBadge')}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!users.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                  {t('admin.usersPage.messages.noResults')}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <AssignRoleModal
        isOpen={Boolean(assignRoleUserId)}
        isSubmitting={isAssignRoleSubmitting}
        title={t('admin.usersPage.assignRoleModal.title', {
          user: selectedUserForAssignRole?.fullName ?? '',
        })}
        roleLabel={t('admin.usersPage.assignRoleModal.role')}
        cancelLabel={t('common.cancel')}
        submitLabel={t('common.submit')}
        roleOptions={roleOptions}
        onClose={closeAssignRoleModal}
        onSubmit={submitAssignRole}
      />

      <AssignBadgeModal
        isOpen={Boolean(assignBadgeUserId)}
        isSubmitting={isAssignBadgeSubmitting}
        title={t('admin.usersPage.assignBadgeModal.title')}
        typeLabel={t('admin.usersPage.assignBadgeModal.type')}
        nameLabel={t('admin.usersPage.assignBadgeModal.name')}
        descriptionLabel={t('admin.usersPage.assignBadgeModal.description')}
        cancelLabel={t('common.cancel')}
        submitLabel={t('common.submit')}
        onClose={closeAssignBadgeModal}
        onSubmit={submitAssignBadge}
      />
    </div>
  )
}
