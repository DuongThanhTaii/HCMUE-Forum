import { useModPostsPage } from '../hooks/useModPostsPage'

function formatDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString()
}

export function ModPostsPage() {
  const { t, posts, isLoading, isError, isEmpty, onApprove, isPublishing, feedback } = useModPostsPage()

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

  if (isEmpty) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">{t('forum.mod.noPendingPosts')}</div>
  }

  return (
    <section className="space-y-3">
      <header className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">{t('forum.mod.pendingPostsTitle')}</h2>
        {feedback ? <p className="mt-2 text-sm text-slate-600">{feedback}</p> : null}
      </header>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full table-auto text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">{t('forum.mod.columns.title')}</th>
              <th className="px-3 py-2">{t('forum.mod.columns.author')}</th>
              <th className="px-3 py-2">{t('forum.mod.columns.category')}</th>
              <th className="px-3 py-2">{t('forum.mod.columns.createdAt')}</th>
              <th className="px-3 py-2">{t('forum.mod.columns.comments')}</th>
              <th className="px-3 py-2">{t('forum.mod.columns.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-3 py-2 font-medium text-slate-900">{post.title}</td>
                <td className="px-3 py-2 text-slate-600">{post.authorName ?? t('common.noData')}</td>
                <td className="px-3 py-2 text-slate-600">{post.categoryName ?? t('common.noData')}</td>
                <td className="px-3 py-2 text-slate-500">{formatDate(post.createdAt)}</td>
                <td className="px-3 py-2 text-slate-500">{post.commentCount}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    disabled={isPublishing}
                    onClick={() => onApprove(post.id)}
                    className="rounded-md border border-emerald-600 bg-emerald-50 px-2 py-1 text-[12px] font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    {t('forum.mod.actions.approve')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
