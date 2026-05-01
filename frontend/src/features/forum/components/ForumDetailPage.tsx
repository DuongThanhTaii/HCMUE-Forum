import { ArrowBigDown, ArrowBigUp, CornerDownRight } from 'lucide-react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { CommentThreadNode } from '../hooks/useForumDetailPage'
import { useForumDetailPage } from '../hooks/useForumDetailPage'

function formatCommentTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

type CommentActions = {
  replyingToId: string | null
  replyDraft: string
  hasTriedReplySubmit: boolean
  onReplyDraftChange: (v: string) => void
  onStartReply: (id: string) => void
  onCancelReply: () => void
  onSubmitReply: (e: FormEvent<HTMLFormElement>) => Promise<void>
  onVoteComment: (commentId: string, voteType: 1 | 2) => Promise<void>
  isVotingComment: boolean
  t: (key: string) => string
}

function CommentBranch({
  node,
  depth,
  actions,
}: {
  node: CommentThreadNode
  depth: number
  actions: CommentActions
}) {
  const time = formatCommentTime(node.createdAt)
  const isReplying = actions.replyingToId === node.id
  const isUpvoted = node.currentUserVote === 1
  const isDownvoted = node.currentUserVote === 2
  return (
    <div className={depth > 0 ? 'mt-3 border-l-2 border-slate-200 pl-4' : ''}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
        <span className="font-medium text-slate-700">{node.authorName}</span>
        <span className="text-slate-400 tabular-nums">{time}</span>
      </div>
      <p className="mt-1.5 text-[14px] leading-6 text-slate-700">{node.content}</p>

      <div className="mt-1.5 flex items-center gap-1">
        <button
          type="button"
          onClick={() => void actions.onVoteComment(node.id, 1)}
          disabled={actions.isVotingComment}
          aria-pressed={isUpvoted}
          className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[12px] font-medium disabled:opacity-50 ${
            isUpvoted
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-slate-500 hover:bg-slate-100 hover:text-emerald-600'
          }`}
          title="Upvote"
        >
          <ArrowBigUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          <span className="tabular-nums">{node.voteScore}</span>
        </button>
        <button
          type="button"
          onClick={() => void actions.onVoteComment(node.id, 2)}
          disabled={actions.isVotingComment}
          aria-pressed={isDownvoted}
          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[12px] font-medium disabled:opacity-50 ${
            isDownvoted ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:bg-slate-100 hover:text-rose-500'
          }`}
          title="Downvote"
        >
          <ArrowBigDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => (isReplying ? actions.onCancelReply() : actions.onStartReply(node.id))}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 hover:text-primary"
        >
          <CornerDownRight className="h-3 w-3" strokeWidth={2} aria-hidden />
          {isReplying ? actions.t('forum.commentSection.cancelReply') : actions.t('forum.commentSection.reply')}
        </button>
      </div>

      {isReplying ? (
        <form
          onSubmit={(e) => void actions.onSubmitReply(e)}
          className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2"
        >
          <textarea
            value={actions.replyDraft}
            onChange={(e) => actions.onReplyDraftChange(e.target.value)}
            rows={2}
            autoFocus
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-[13px] focus:border-primary focus:outline-none"
            placeholder={actions.t('forum.detail.commentPlaceholder')}
          />
          {actions.hasTriedReplySubmit && !actions.replyDraft.trim() ? (
            <p className="mt-0.5 text-[11px] text-rose-600">{actions.t('forum.feedback.commentRequired')}</p>
          ) : null}
          <div className="mt-1.5 flex justify-end gap-2">
            <button
              type="button"
              onClick={actions.onCancelReply}
              className="rounded px-2.5 py-1 text-[12px] font-medium text-slate-600 hover:bg-slate-200"
            >
              {actions.t('forum.commentSection.cancelReply')}
            </button>
            <button
              type="submit"
              disabled={!actions.replyDraft.trim()}
              className="rounded bg-primary px-2.5 py-1 text-[12px] font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {actions.t('forum.commentSection.reply')}
            </button>
          </div>
        </form>
      ) : null}

      {node.children.length > 0 ? (
        <div className="mt-2 space-y-1">
          {node.children.map((ch) => (
            <CommentBranch key={ch.id} node={ch} depth={depth + 1} actions={actions} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function ForumDetailPage() {
  const {
    t,
    post,
    title,
    category,
    authorLine,
    activityText,
    postContent,
    voteScore,
    commentThreads,
    commentDraft,
    onCommentDraftChange,
    hasTriedCommentSubmit,
    canSubmitComment,
    onSubmitComment,
    onUpvotePost,
    onVoteComment,
    replyingToCommentId,
    replyDraft,
    setReplyDraft,
    hasTriedReplySubmit,
    onStartReply,
    onCancelReply,
    onSubmitReply,
    onToggleBookmark,
    onOpenReportModal,
    onCloseReportModal,
    onSubmitReportModal,
    reportOpen,
    reportReason,
    setReportReason,
    reportDescription,
    setReportDescription,
    onSharePost,
    interactionErrorKey,
    interactionSuccessKey,
    isBookmarked,
    isCommentsLoading,
    isSubmittingComment,
    isVotingComment,
    isVoting,
    isBookmarking,
    isUnbookmarking,
    isReporting,
    isLoading,
    isError,
  } = useForumDetailPage()

  const commentActions: CommentActions = {
    replyingToId: replyingToCommentId,
    replyDraft,
    hasTriedReplySubmit,
    onReplyDraftChange: setReplyDraft,
    onStartReply,
    onCancelReply,
    onSubmitReply,
    onVoteComment,
    isVotingComment,
    t,
  }

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
          {authorLine ? (
            <>
              <span className="font-medium text-slate-700">{authorLine}</span>
              <span className="text-slate-300">|</span>
            </>
          ) : null}
          <span className="font-medium text-slate-600">{category}</span>
          <span className="text-slate-300">|</span>
          <span>
            {t('forum.replies')}: {post?.replyCount ?? 0}
          </span>
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
            className="inline-flex items-center gap-2 rounded-md border border-primary px-3 py-1.5 text-[13px] font-medium text-primary hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowBigUp className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            <span className="tabular-nums font-semibold">{voteScore}</span>
            <span className="text-slate-600">{t('forum.actions.upvote')}</span>
          </button>
          <button
            type="button"
            onClick={onOpenReportModal}
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

      {reportOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          role="presentation"
          tabIndex={-1}
          onClick={onCloseReportModal}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onCloseReportModal()
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-dialog-title"
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="report-dialog-title" className="text-base font-semibold text-slate-900">
              {t('forum.reportModal.title')}
            </h2>
            <p className="mt-1 text-[13px] text-slate-600">{t('forum.reportModal.subtitle')}</p>
            <label htmlFor="report-reason" className="mt-4 block text-[12px] font-medium text-slate-700">
              {t('forum.reportModal.reasonLabel')}
            </label>
            <select
              id="report-reason"
              value={reportReason}
              onChange={(e) => setReportReason(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-[14px] text-slate-900 focus:border-primary focus:outline-none"
            >
              <option value={1}>{t('forum.reportModal.reasons.spam')}</option>
              <option value={2}>{t('forum.reportModal.reasons.harassment')}</option>
              <option value={3}>{t('forum.reportModal.reasons.inappropriate')}</option>
              <option value={4}>{t('forum.reportModal.reasons.misinformation')}</option>
              <option value={5}>{t('forum.reportModal.reasons.offTopic')}</option>
              <option value={6}>{t('forum.reportModal.reasons.copyright')}</option>
              <option value={99}>{t('forum.reportModal.reasons.other')}</option>
            </select>
            <label htmlFor="report-details" className="mt-3 block text-[12px] font-medium text-slate-700">
              {t('forum.reportModal.detailsLabel')}
            </label>
            <textarea
              id="report-details"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-[14px] focus:border-primary focus:outline-none"
              placeholder={t('forum.reportModal.detailsPlaceholder')}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCloseReportModal}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
              >
                {t('forum.reportModal.cancel')}
              </button>
              <button
                type="button"
                onClick={() => void onSubmitReportModal()}
                disabled={isReporting}
                className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isReporting ? t('common.loading') : t('forum.reportModal.submit')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="forum-compact-card overflow-hidden">
        <header className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-[13px] font-semibold text-slate-600">
          {t('forum.replies')}
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
          {!isCommentsLoading
            ? commentThreads.map((node) => (
                <article key={node.id} className="px-4 py-3">
                  <CommentBranch node={node} depth={0} actions={commentActions} />
                </article>
              ))
            : null}
          {!isCommentsLoading && commentThreads.length === 0 ? (
            <div className="px-4 py-3 text-[14px] text-slate-500">{t('forum.commentSection.noComments')}</div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
