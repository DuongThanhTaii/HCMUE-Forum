import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useAuth } from '@features/auth/context/useAuth'
import {
  useAddCommentMutation,
  useBookmarkPostMutation,
  useGetForumPostByIdQuery,
  useGetPostCommentsQuery,
  useReportPostMutation,
  useUnbookmarkPostMutation,
  useVotePostMutation,
} from '../api/forum.list.api'

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export function useForumDetailPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ id: string }>()
  const { requireAuth } = useAuth()
  const [commentDraft, setCommentDraft] = useState('')
  const [hasTriedCommentSubmit, setHasTriedCommentSubmit] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [interactionErrorKey, setInteractionErrorKey] = useState<string | null>(null)
  const [interactionSuccessKey, setInteractionSuccessKey] = useState<string | null>(null)
  const { data: post, isLoading, isError } = useGetForumPostByIdQuery(id, {
    skip: !id,
  })
  const { data: commentData = [], isLoading: isCommentsLoading } = useGetPostCommentsQuery(
    { postId: id, pageNumber: 1, pageSize: 30 },
    { skip: !id },
  )
  const [addComment, { isLoading: isSubmittingComment }] = useAddCommentMutation()
  const [votePost, { isLoading: isVoting }] = useVotePostMutation()
  const [bookmarkPost, { isLoading: isBookmarking }] = useBookmarkPostMutation()
  const [unbookmarkPost, { isLoading: isUnbookmarking }] = useUnbookmarkPostMutation()
  const [reportPost, { isLoading: isReporting }] = useReportPostMutation()

  const fallbackTitle = t('forum.detail.fallbackTitle')
  const title = post?.title || `${fallbackTitle} #${id || t('common.noData')}`
  const category = post?.category || t('forum.categories')
  const activityText = post?.activityAt ? formatDateTime(post.activityAt) : t('common.noData')
  const realPostContent =
    (post as { content?: string } | undefined)?.content?.trim() ||
    (post as { body?: string } | undefined)?.body?.trim() ||
    ''
  const postContent = realPostContent || t('forum.detail.fallbackContent')

  const comments = useMemo(
    () =>
      commentData.map((comment) => ({
        id: comment.id,
        author: comment.authorName,
        content: comment.content,
        time: formatDateTime(comment.createdAt),
      })),
    [commentData],
  )

  function setFeedback(successKey: string | null, errorKey: string | null) {
    setInteractionSuccessKey(successKey)
    setInteractionErrorKey(errorKey)
  }

  function getMutationErrorKey(error: unknown, fallbackKey: string) {
    const status = (error as { status?: number } | undefined)?.status
    if (status === 401 || status === 403) {
      return 'forum.feedback.loginRequired'
    }
    return fallbackKey
  }

  function ensureAuthenticated() {
    return requireAuth(() => {
      setFeedback(null, 'forum.feedback.loginRequired')
    })
  }

  const canSubmitComment = commentDraft.trim().length > 0 && !isSubmittingComment && Boolean(id)

  function onCommentDraftChange(value: string) {
    setCommentDraft(value)
    if (interactionErrorKey || interactionSuccessKey) {
      setFeedback(null, null)
    }
  }

  async function onSubmitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null, null)
    setHasTriedCommentSubmit(true)
    if (!canSubmitComment) {
      if (commentDraft.trim().length === 0) {
        setFeedback(null, 'forum.feedback.commentRequired')
      }
      return
    }
    if (!ensureAuthenticated()) {
      return
    }

    try {
      await addComment({ postId: id, content: commentDraft.trim() }).unwrap()
      setCommentDraft('')
      setHasTriedCommentSubmit(false)
      setFeedback('forum.feedback.commentSuccess', null)
    } catch (error) {
      setFeedback(null, getMutationErrorKey(error, 'forum.feedback.commentFailed'))
    }
  }

  async function onUpvotePost() {
    setFeedback(null, null)
    if (!id || isVoting) {
      return
    }
    if (!ensureAuthenticated()) {
      return
    }
    try {
      await votePost({ postId: id, voteType: 1 }).unwrap()
      setFeedback('forum.feedback.voteSuccess', null)
    } catch (error) {
      setFeedback(null, getMutationErrorKey(error, 'forum.feedback.voteFailed'))
    }
  }

  async function onToggleBookmark() {
    setFeedback(null, null)
    if (!id || isBookmarking || isUnbookmarking) {
      return
    }
    if (!ensureAuthenticated()) {
      return
    }

    try {
      if (isBookmarked) {
        setIsBookmarked(false)
        await unbookmarkPost({ postId: id }).unwrap()
        setFeedback('forum.feedback.unbookmarkSuccess', null)
        return
      }

      setIsBookmarked(true)
      await bookmarkPost({ postId: id }).unwrap()
      setFeedback('forum.feedback.bookmarkSuccess', null)
    } catch (error) {
      setIsBookmarked((prev) => !prev)
      setFeedback(
        null,
        getMutationErrorKey(
          error,
          isBookmarked ? 'forum.feedback.unbookmarkFailed' : 'forum.feedback.bookmarkFailed',
        ),
      )
    }
  }

  async function onReportPost() {
    setFeedback(null, null)
    if (!id || isReporting) {
      return
    }
    if (!ensureAuthenticated()) {
      return
    }
    try {
      await reportPost({
        postId: id,
        reason: 2,
        description: 'Reported from forum detail UI',
      }).unwrap()
      setFeedback('forum.feedback.reportSuccess', null)
    } catch (error) {
      setFeedback(null, getMutationErrorKey(error, 'forum.feedback.reportFailed'))
    }
  }

  async function onSharePost() {
    setFeedback(null, null)
    if (!id) {
      return
    }

    const shareUrl = window.location.href
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setFeedback('forum.feedback.shareSuccess', null)
        return
      }

      setFeedback(null, 'forum.feedback.shareUnavailable')
    } catch {
      setFeedback(null, 'forum.feedback.shareUnavailable')
    }
  }

  return {
    t,
    post,
    title,
    category,
    activityText,
    postContent,
    comments,
    commentDraft,
    setCommentDraft,
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
  }
}
