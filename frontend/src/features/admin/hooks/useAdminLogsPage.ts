import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useGetAuditLogsQuery,
  useGetTogglesQuery,
  useGetUserActionLogsQuery,
  useSetToggleMutation,
} from '../api/admin.observability.api'
import type { SetEndpointToggleRequest, UserActionLogsViewType } from '../types/admin.types'

export function useAdminLogsPage() {
  const { t } = useTranslation()
  const { data: togglesData, isLoading: isTogglesLoading, isError: isTogglesError } = useGetTogglesQuery()
  const [setToggleMutation, { isLoading: isSetToggleLoading }] = useSetToggleMutation()

  const [auditUserId, setAuditUserId] = useState('')
  const [auditEndpointKey, setAuditEndpointKey] = useState('')
  const [auditResultFilter, setAuditResultFilter] = useState<'all' | 'success' | 'failure'>('all')
  const [auditTake, setAuditTake] = useState(50)
  const [auditFromUtc, setAuditFromUtc] = useState('')
  const [auditToUtc, setAuditToUtc] = useState('')

  const auditParams = useMemo(
    () => ({
      userId: auditUserId.trim() || undefined,
      endpointKey: auditEndpointKey.trim() || undefined,
      isSuccess: auditResultFilter === 'all' ? undefined : auditResultFilter === 'success',
      take: auditTake,
      fromUtc: auditFromUtc.trim() || undefined,
      toUtc: auditToUtc.trim() || undefined,
    }),
    [auditUserId, auditEndpointKey, auditResultFilter, auditTake, auditFromUtc, auditToUtc],
  )

  const { data: auditLogsData, isLoading: isAuditLogsLoading, isError: isAuditLogsError } = useGetAuditLogsQuery(auditParams)

  const [actionViewType, setActionViewTypeState] = useState<UserActionLogsViewType>('Developer')
  const [actionPage, setActionPage] = useState(1)
  const [actionPageSize, setActionPageSize] = useState(100)
  const [actionActorUserId, setActionActorUserId] = useState('')
  const [actionMethod, setActionMethod] = useState('')
  const [actionPathContains, setActionPathContains] = useState('')
  const [actionCorrelationId, setActionCorrelationId] = useState('')
  const [actionTraceId, setActionTraceId] = useState('')
  const [actionFromUtc, setActionFromUtc] = useState('')
  const [actionToUtc, setActionToUtc] = useState('')

  const actionParams = useMemo(
    () => ({
      viewType: actionViewType,
      page: actionPage,
      pageSize: actionPageSize,
      actorUserId: actionActorUserId.trim() || undefined,
      method: actionMethod.trim() || undefined,
      pathContains: actionPathContains.trim() || undefined,
      correlationId: actionCorrelationId.trim() || undefined,
      traceId: actionTraceId.trim() || undefined,
      fromUtc: actionFromUtc.trim() || undefined,
      toUtc: actionToUtc.trim() || undefined,
    }),
    [
      actionViewType,
      actionPage,
      actionPageSize,
      actionActorUserId,
      actionMethod,
      actionPathContains,
      actionCorrelationId,
      actionTraceId,
      actionFromUtc,
      actionToUtc,
    ],
  )

  const { data: actionLogsData, isLoading: isActionLogsLoading, isError: isActionLogsError } = useGetUserActionLogsQuery(actionParams)

  const setActionViewType = (viewType: UserActionLogsViewType) => {
    setActionViewTypeState(viewType)
    setActionPage(1)
  }

  const submitToggle = async (endpointKey: string, isEnabled: boolean, reason: string | null) => {
    const payload: SetEndpointToggleRequest = {
      isEnabled,
      reason: isEnabled ? null : reason,
    }
    await setToggleMutation({ endpointKey, body: payload }).unwrap()
  }

  return {
    t,
    toggles: togglesData ?? [],
    isTogglesLoading,
    isTogglesError,
    isSetToggleLoading,
    submitToggle,

    auditLogs: auditLogsData ?? [],
    isAuditLogsLoading,
    isAuditLogsError,
    auditUserId,
    setAuditUserId,
    auditEndpointKey,
    setAuditEndpointKey,
    auditResultFilter,
    setAuditResultFilter,
    auditTake,
    setAuditTake,
    auditFromUtc,
    setAuditFromUtc,
    auditToUtc,
    setAuditToUtc,

    actionItems: actionLogsData?.items ?? [],
    actionTotal: actionLogsData?.total ?? 0,
    actionPage,
    setActionPage,
    actionPageSize,
    setActionPageSize,
    actionViewType,
    setActionViewType,
    availableActionViewTypes: actionLogsData?.availableViewTypes ?? ['Developer', 'Administrator'],
    isActionLogsLoading,
    isActionLogsError,
    actionActorUserId,
    setActionActorUserId,
    actionMethod,
    setActionMethod,
    actionPathContains,
    setActionPathContains,
    actionCorrelationId,
    setActionCorrelationId,
    actionTraceId,
    setActionTraceId,
    actionFromUtc,
    setActionFromUtc,
    actionToUtc,
    setActionToUtc,
  }
}
