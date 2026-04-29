import { ForumFiltersRow } from './ForumFiltersRow'
import { ForumListTable } from './ForumListTable'
import { useForumListPage } from '../hooks/useForumListPage'

export function ForumListPage() {
  const { t, activeTab, setActiveTab, filteredItems, isLoading, isError, isEmpty } =
    useForumListPage()

  if (isLoading) {
    return (
      <div className="forum-compact-card px-4 py-3 text-[14px] text-slate-600">
        {t('common.loading')}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="forum-compact-card border-rose-200 bg-rose-50 px-4 py-3 text-[14px] text-jasper">
        {t('forum.error.loadFailed')}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="forum-compact-card px-4 py-3 text-[14px] text-slate-600">
        {t('forum.empty.noPosts')}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      <ForumFiltersRow
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <ForumListTable items={filteredItems} />
    </div>
  )
}
