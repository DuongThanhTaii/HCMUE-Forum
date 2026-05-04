import { startTransition, useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useAuth } from '@features/auth/context/useAuth'
import type { ForumCommentItem } from '../api/forum.list.api'
import {
  useAddCommentMutation,
  useBookmarkPostMutation,
  useGetForumPostByIdQuery,
  useGetPostCommentsQuery,
  useReportPostMutation,
  useUnbookmarkPostMutation,
  useUploadForumAttachmentsMutation,
  useVoteCommentMutation,
  useVotePostMutation,
} from '../api/forum.list.api'

export type CommentThreadNode = ForumCommentItem & { children: CommentThreadNode[] }

function buildCommentThreads(flat: ForumCommentItem[]): CommentThreadNode[] {
  // Build map with children sorted by time (natural reply order)
  const byTime = [...flat].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
  const map = new Map<string, CommentThreadNode>()
  for (const c of byTime) {
    map.set(c.id, { ...c, children: [] })
  }
  const roots: CommentThreadNode[] = []
  for (const c of byTime) {
    const node = map.get(c.id)!
    const pid = c.parentCommentId
    if (pid && map.has(pid)) {
      map.get(pid)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  // Sort root comments by vote score (highest first); ties → newest first
  roots.sort((a, b) => {
    const voteDiff = (b.voteScore ?? 0) - (a.voteScore ?? 0)
    if (voteDiff !== 0) return voteDiff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  return roots
}

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
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null)
  const [replyDraft, setReplyDraft] = useState('')
  const [hasTriedReplySubmit, setHasTriedReplySubmit] = useState(false)
  const [commentAttachments, setCommentAttachments] = useState<File[]>([])
  const [replyAttachments, setReplyAttachments] = useState<File[]>([])
  const { data: post, isLoading, isError } = useGetForumPostByIdQuery(id, {
    skip: !id,
  })
  useEffect(() => {
    startTransition(() => {
      setIsBookmarked(post?.isBookmarked === true)
    })
  }, [post?.isBookmarked])
  const { data: commentData = [], isLoading: isCommentsLoading } = useGetPostCommentsQuery(
    { postId: id, pageNumber: 1, pageSize: 30 },
    { skip: !id },
  )
  const [addComment, { isLoading: isSubmittingComment }] = useAddCommentMutation()
  const [votePost, { isLoading: isVoting }] = useVotePostMutation()
  const [voteComment, { isLoading: isVotingComment }] = useVoteCommentMutation()
  const [bookmarkPost, { isLoading: isBookmarking }] = useBookmarkPostMutation()
  const [unbookmarkPost, { isLoading: isUnbookmarking }] = useUnbookmarkPostMutation()
  const [reportPost, { isLoading: isReporting }] = useReportPostMutation()
  const [uploadAttachments, { isLoading: isUploadingAttachments }] = useUploadForumAttachmentsMutation()

  const fallbackTitle = t('forum.detail.fallbackTitle')
  const title = post?.title || `${fallbackTitle} #${id || t('common.noData')}`
  const category = post?.category || t('forum.categories')
  const authorLine = post?.authorName?.trim() || null
  const activityText = post?.activityAt ? formatDateTime(post.activityAt) : t('common.noData')
  const realPostContent =
    (post as { content?: string } | undefined)?.content?.trim() ||
    (post as { body?: string } | undefined)?.body?.trim() ||
    ''
  const postContent = realPostContent || t('forum.detail.fallbackContent')
  const voteScore = typeof post?.voteScore === 'number' ? post.voteScore : 0

  const commentThreads = useMemo(() => buildCommentThreads(commentData), [commentData])

  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState<number>(1)
  const [reportDescription, setReportDescription] = useState('')

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
      let finalContent = commentDraft.trim()
      if (commentAttachments.length > 0) {
        const urls = await uploadAttachments(commentAttachments).unwrap()
        if (urls.length > 0) {
          finalContent = `${finalContent}\n\nAttachments:\n${urls.map((u) => `- ${u}`).join('\n')}`
        }
      }
      await addComment({ postId: id, content: finalContent }).unwrap()
      setCommentDraft('')
      setCommentAttachments([])
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

  async function onVoteComment(commentId: string, voteType: 1 | 2) {
    if (!id || !commentId || isVotingComment) return
    if (!ensureAuthenticated()) return
    try {
      await voteComment({ commentId, postId: id, voteType }).unwrap()
    } catch {
      /* optimistic update already rolled back by RTK Query */
    }
  }

  function onStartReply(commentId: string) {
    if (!ensureAuthenticated()) return
    setReplyingToCommentId(commentId)
    setReplyDraft('')
    setReplyAttachments([])
    setHasTriedReplySubmit(false)
  }

  function onCancelReply() {
    setReplyingToCommentId(null)
    setReplyDraft('')
    setReplyAttachments([])
    setHasTriedReplySubmit(false)
  }

  async function onSubmitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setHasTriedReplySubmit(true)
    if (!replyDraft.trim() || !replyingToCommentId || !id) return
    try {
      let finalContent = replyDraft.trim()
      if (replyAttachments.length > 0) {
        const urls = await uploadAttachments(replyAttachments).unwrap()
        if (urls.length > 0) {
          finalContent = `${finalContent}\n\nAttachments:\n${urls.map((u) => `- ${u}`).join('\n')}`
        }
      }
      await addComment({
        postId: id,
        content: finalContent,
        parentCommentId: replyingToCommentId,
      }).unwrap()
      setReplyingToCommentId(null)
      setReplyDraft('')
      setReplyAttachments([])
      setHasTriedReplySubmit(false)
    } catch (error) {
      setFeedback(null, getMutationErrorKey(error, 'forum.feedback.commentFailed'))
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

  function onOpenReportModal() {
    setFeedback(null, null)
    if (!id) {
      return
    }
    if (!ensureAuthenticated()) {
      return
    }
    setReportReason(1)
    setReportDescription('')
    setReportOpen(true)
  }

  function onCloseReportModal() {
    setReportOpen(false)
  }

  async function onSubmitReportModal() {
    setFeedback(null, null)
    if (!id || isReporting) {
      return
    }
    try {
      await reportPost({
        postId: id,
        reason: reportReason,
        description: reportDescription.trim() || undefined,
      }).unwrap()
      setReportOpen(false)
      setReportDescription('')
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

  function onShareFacebook() {
    const directUrl = `${window.location.origin}/forum/${id}`
    const quote = `${title}\n${postContent.slice(0, 180)}`
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(directUrl)}&quote=${encodeURIComponent(quote)}`
    window.open(fbShareUrl, '_blank', 'noopener,noreferrer,width=700,height=560')
  }

  return {
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
    setCommentDraft,
    commentAttachments,
    setCommentAttachments,
    onCommentDraftChange,
    hasTriedCommentSubmit,
    canSubmitComment,
    onSubmitComment,
    onUpvotePost,
    onVoteComment,
    replyingToCommentId,
    replyDraft,
    setReplyDraft,
    replyAttachments,
    setReplyAttachments,
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
    onShareFacebook,
    interactionErrorKey,
    interactionSuccessKey,
    isBookmarked,
    isCommentsLoading,
    isSubmittingComment,
    isUploadingAttachments,
    isVotingComment,
    isVoting,
    isBookmarking,
    isUnbookmarking,
    isReporting,
    isLoading,
    isError,
  }
}
