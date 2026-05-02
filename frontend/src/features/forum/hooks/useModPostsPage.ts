import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePublishForumPostMutation } from '../api/forum.list.api'
import { useGetModerationPendingPostsQuery } from '../api/forum.moderation.api'

export function useModPostsPage() {
  const { t } = useTranslation()
  const { data = [], isLoading, isError } = useGetModerationPendingPostsQuery({ pageNumber: 1, pageSize: 30 })
  const [publishPost, { isLoading: isPublishing }] = usePublishForumPostMutation()
  const [feedback, setFeedback] = useState<string | null>(null)

  const onApprove = useCallback(
    async (postId: string) => {
      setFeedback(null)
      try {
        await publishPost({ postId }).unwrap()
        setFeedback(t('forum.mod.feedback.approveSuccess'))
      } catch {
        setFeedback(t('forum.mod.feedback.approveFailed'))
      }
    },
    [publishPost, t],
  )

  return {
    t,
    posts: data,
    isLoading,
    isError,
    isEmpty: !isLoading && !isError && data.length === 0,
    onApprove,
    isPublishing,
    feedback,
  }
}
