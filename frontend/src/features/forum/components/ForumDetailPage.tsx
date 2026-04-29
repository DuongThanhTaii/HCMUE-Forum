import { Link } from 'react-router-dom'
import { useForumDetailPage } from '../hooks/useForumDetailPage'

export function ForumDetailPage() {
  const {
    t,
    post,
    title,
    category,
    activityText,
    postContent,
    comments,
    commentDraft,
    onCommentDraftChange,
    hasTriedCommentSubmit,
    canSubmitComment,
    onSubmitComment,
    onUpvotePost,
    onToggleBookmark,
    onReportPost,
    onSharePost,
    interactionErrorKey,
    interactionSuccessKey,
    isBookmarked,
    isCommentsLoading,
    isSubmittingComment,
    isVoting,
    isBookmarking,
    isUnbookmarking,
    isReporting,
    isLoading,
    isError,
  } = useForumDetailPage()

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

  return (
    <div className="space-y-2.5">
      <nav className="forum-compact-card px-4 py-2 text-[13px] text-slate-600">
        <Link to="/forum" className="forum-topic-link hover:text-primary">
          {t('forum.title')}
        </Link>
        <span className="mx-1.5 text-slate-400">/</span>
        <span className="font-medium text-slate-700">{title}</span>
      </nav>

      <section className="forum-compact-card px-4 py-3">
        <h1 className="text-[18px] font-semibold text-slate-900">{title}</h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-500">
          <span className="font-medium text-slate-600">{category}</span>
          <span className="text-slate-300">|</span>
          <span>{t('forum.comments')}: {post?.replyCount ?? 0}</span>
          <span className="text-slate-300">|</span>
          <span>{t('forum.meta.lastUpdated')}: {activityText}</span>
        </div>
        {post?.tags?.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span key={tag} className="forum-tag-chip px-1.5 py-0.5 text-[12px] font-medium">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-3 border-t border-slate-200 pt-3">
          <p className="text-[14px] leading-6 text-slate-700">{postContent}</p>
        </div>
      </section>

      <section className="forum-compact-card border-t border-slate-200 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void onUpvotePost()}
            disabled={isVoting}
            className="rounded-md border border-primary px-3 py-1.5 text-[13px] font-medium text-primary hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('forum.actions.upvote')}
          </button>
          <button
            type="button"
            onClick={() => void onReportPost()}
            disabled={isReporting}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('forum.actions.report')}
          </button>
          <button
            type="button"
            onClick={() => void onToggleBookmark()}
            disabled={isBookmarking || isUnbookmarking}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBookmarked ? t('forum.actions.unbookmark') : t('forum.actions.bookmark')}
          </button>
          <button
            type="button"
            onClick={() => void onSharePost()}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:border-primary hover:text-primary"
          >
            {t('forum.actions.share')}
          </button>
        </div>
        {interactionSuccessKey ? (
          <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-700">
            {t(interactionSuccessKey)}
          </div>
        ) : null}
        {interactionErrorKey ? (
          <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
            {t(interactionErrorKey)}
          </div>
        ) : null}
      </section>

      <section className="forum-compact-card overflow-hidden">
        <header className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-[13px] font-semibold text-slate-600">
          {t('forum.comments')}
        </header>
        <form onSubmit={(event) => void onSubmitComment(event)} className="border-b border-slate-100 px-4 py-3">
          <label htmlFor="comment-content" className="mb-1 block text-[12px] font-medium text-slate-600">
            {t('forum.actions.reply')}
          </label>
          <textarea
            id="comment-content"
            value={commentDraft}
            onChange={(event) => onCommentDraftChange(event.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px] focus:border-primary focus:outline-none"
            placeholder={t('forum.detail.commentPlaceholder')}
          />
          {hasTriedCommentSubmit && commentDraft.trim().length === 0 ? (
            <p className="mt-1 text-[12px] text-rose-600">{t('forum.feedback.commentRequired')}</p>
          ) : null}
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!canSubmitComment}
              className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmittingComment ? t('common.loading') : t('forum.actions.reply')}
            </button>
          </div>
        </form>
        <div className="divide-y divide-slate-100">
          {isCommentsLoading ? (
            <div className="px-4 py-3 text-[14px] text-slate-500">{t('common.loading')}</div>
          ) : null}
          {comments.map((comment) => (
            <article key={comment.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="font-medium text-slate-700">{comment.author}</span>
                <span className="text-slate-500">{comment.time}</span>
              </div>
              <p className="mt-1.5 text-[14px] leading-6 text-slate-700">{comment.content}</p>
            </article>
          ))}
          {!isCommentsLoading && comments.length === 0 ? (
            <div className="px-4 py-3 text-[14px] text-slate-500">{t('forum.commentSection.noComments')}</div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
