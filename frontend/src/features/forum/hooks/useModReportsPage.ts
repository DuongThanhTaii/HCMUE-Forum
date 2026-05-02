import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGetModerationReportsQuery,
  useResolveModerationReportMutation,
} from '../api/forum.moderation.api'
import type { ModerationReportStatusFilter } from '../types/forum-moderation'

export function useModReportsPage() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<ModerationReportStatusFilter>('pending')
  const { data, isLoading, isError, isFetching } = useGetModerationReportsQuery({ status, pageNumber: 1, pageSize: 30 })
  const [resolveReport, { isLoading: isResolving }] = useResolveModerationReportMutation()
  const [feedback, setFeedback] = useState<string | null>(null)

  const reports = data?.reports ?? []
  const totalCount = data?.totalCount ?? 0

  const tabs = useMemo(
    () => [
      { id: 'pending' as const, label: t('forum.mod.status.pending') },
      { id: 'resolved_keep' as const, label: t('forum.mod.status.resolvedKeep') },
      { id: 'resolved_remove' as const, label: t('forum.mod.status.resolvedRemove') },
    ],
    [t],
  )

  async function onResolve(reportId: number, action: 'keep' | 'remove') {
    setFeedback(null)
    try {
      await resolveReport({ reportId, action }).unwrap()
      setFeedback(t('forum.mod.feedback.resolveSuccess'))
    } catch {
      setFeedback(t('forum.mod.feedback.resolveFailed'))
    }
  }

  return {
    t,
    status,
    setStatus,
    tabs,
    reports,
    totalCount,
    isLoading,
    isError,
    isFetching,
    isResolving,
    feedback,
    onResolve,
  }
}
