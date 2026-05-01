import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetForumListQuery } from '../api/forum.list.api'
import { MessageSquare } from 'lucide-react'

export function HomePage() {
  const { t } = useTranslation()
  const { data: posts = [], isLoading, isError } = useGetForumListQuery({ pageNumber: 1, pageSize: 8 })

  return (
    <div className="space-y-8">
      <section className="forum-compact-card p-5 transition-colors md:p-6">
        <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">
          {t('home.welcomeTitle')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
          {t('home.welcomeSubtitle')}
        </p>
        <Link
          to="/forum"
          className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-hover"
        >
          <MessageSquare className="h-4 w-4" aria-hidden />
          {t('home.gotoForum')}
        </Link>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t('home.latestTopics')}
          </h2>
          <Link
            to="/forum"
            className="cursor-pointer text-xs font-medium text-primary transition-colors hover:underline"
          >
            {t('home.viewAll')}
          </Link>
        </div>

        {isLoading ? (
          <div className="forum-compact-card px-4 py-3 text-sm text-slate-600">{t('common.loading')}</div>
        ) : null}
        {isError ? (
          <div className="forum-compact-card border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {t('forum.error.loadFailed')}
          </div>
        ) : null}

        {!isLoading && !isError && posts.length === 0 ? (
          <div className="forum-compact-card px-4 py-3 text-sm text-slate-600">{t('forum.empty.noPosts')}</div>
        ) : null}

        {!isLoading && !isError && posts.length > 0 ? (
          <div className="forum-compact-card divide-y divide-slate-100 overflow-hidden">
            {posts.map((post) => (
              <article key={post.id} className="transition-colors hover:bg-slate-50">
                <Link
                  to={`/forum/${post.id}`}
                  className="block cursor-pointer px-4 py-3 no-underline"
                >
                  <h3 className="text-sm font-semibold text-slate-900 hover:text-primary md:text-base">
                    {post.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500 md:text-sm">
                    <span className="text-slate-600">{post.category}</span>
                    {post.tags.length > 0 ? (
                      <>
                        {' · '}
                        {post.tags.slice(0, 3).join(', ')}
                      </>
                    ) : null}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>
                      {t('forum.replies')}: <span className="font-semibold text-slate-700">{post.replyCount}</span>
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
