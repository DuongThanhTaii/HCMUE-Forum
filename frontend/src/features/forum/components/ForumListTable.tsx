import type { ForumListItem } from '../types/forum-list'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type ForumListTableProps = {
  items: ForumListItem[]
}

function formatActivityDate(activityAt: string) {
  const date = new Date(activityAt)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export function ForumListTable({ items }: ForumListTableProps) {
  const { t } = useTranslation()

  return (
    <section className="forum-compact-card overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_96px_160px] border-b border-slate-200 bg-slate-50 px-4 py-2 text-[13px] font-semibold text-slate-600">
        <span>{t('forum.post')}</span>
        <span className="text-right">{t('forum.comments')}</span>
        <span className="text-right">{t('forum.meta.lastUpdated')}</span>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <article
            key={item.id}
            className="grid min-h-14 grid-cols-[minmax(0,1fr)_96px_160px] items-center gap-3 px-4 py-2 transition-colors hover:bg-slate-50"
          >
            <div className="min-w-0">
              <h2 className="truncate text-[14px] font-semibold">
                <Link
                  to={`/forum/${item.id}`}
                  className="forum-topic-link text-slate-900 hover:text-primary"
                >
                  {item.title}
                </Link>
              </h2>
              <p className="mt-0.5 truncate text-[13px] text-slate-500">
                {item.category}
                {item.tags.length > 0 && (
                  <>
                    {' · '}
                    {item.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="forum-tag-chip mr-1 inline-block px-1.5 py-0.5 text-[12px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </>
                )}
              </p>
            </div>
            <p className="text-right text-[14px] font-semibold text-slate-700">{item.replyCount}</p>
            <p className="text-right text-[13px] text-slate-500">
              {formatActivityDate(item.activityAt) || t('common.noData')}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
