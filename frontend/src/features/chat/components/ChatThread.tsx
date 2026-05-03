import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, Phone, PhoneMissed } from 'lucide-react'
import {
  useDeleteMessageMutation,
  useEditMessageMutation,
  useGetMessagesQuery,
} from '../api/chat.api'
import { useChatContext } from '../context/ChatContext'
import { resolveChatAssetUrl } from '../lib/mediaUrl'
import type { ChatThreadRef, HubMessageNotification, MessageDto } from '../types/chat.types'
import { VoiceMessagePlayer } from './VoiceMessagePlayer'

function primaryMime(mime: string): string {
  const s = mime.trim()
  const i = s.indexOf(';')
  return i >= 0 ? s.slice(0, i).trim().toLowerCase() : s.toLowerCase()
}

function isAudioMime(mime: string): boolean {
  return primaryMime(mime).startsWith('audio/')
}

function isImageMime(mime: string): boolean {
  return primaryMime(mime).startsWith('image/')
}

function hubToDisplay(m: HubMessageNotification): MessageDto {
  return {
    id: m.messageId,
    conversationId: m.conversationId,
    senderId: m.senderId,
    content: m.content,
    type: m.messageType,
    sentAt: m.sentAt,
    editedAt: null,
    isDeleted: false,
    replyToMessageId: m.replyToMessageId ?? null,
    reactions: {},
    attachments: m.attachments ?? [],
  }
}

export function ChatThread({
  threadRef,
  currentUserId,
}: {
  threadRef: ChatThreadRef
  currentUserId: string | null
}) {
  const { t } = useTranslation()
  const { channelTranscripts, typingPeerNamesByConversation } = useChatContext()

  const convId = threadRef.kind === 'conversation' ? threadRef.conversationId : null
  const { data, isLoading, isError } = useGetMessagesQuery(
    { conversationId: convId ?? '', page: 1, pageSize: 50 },
    { skip: !convId }
  )

  const channelLines = useMemo(() => {
    if (threadRef.kind !== 'channel') return []
    return channelTranscripts[threadRef.channelId] ?? []
  }, [channelTranscripts, threadRef])

  const typingPeers =
    threadRef.kind === 'conversation' ? typingPeerNamesByConversation[threadRef.conversationId] ?? [] : []

  let messages: MessageDto[] = []
  if (threadRef.kind === 'conversation' && data?.items) {
    messages = [...data.items].sort(
      (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    )
  } else if (threadRef.kind === 'channel') {
    messages = channelLines.map(hubToDisplay)
  }

  if (threadRef.kind === 'channel') {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {t('chat.channelHistoryNotice')}
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-slate-500">{t('chat.channelEmptyLive')}</p>
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={`${m.id}-${m.editedAt ?? ''}-${m.isDeleted}`}
                message={m}
                isSelf={m.senderId === currentUserId}
                conversationId={null}
              />
            ))
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-sm text-slate-500">{t('common.loading')}</div>
  }
  if (isError || !convId) {
    return (
      <div className="text-sm text-red-600">{t('chat.cannotLoadMessages')}</div>
    )
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col gap-1">
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white p-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500">{t('chat.thread.noMessagesYet')}</p>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={`${m.id}-${m.editedAt ?? ''}-${m.isDeleted}`}
              message={m}
              isSelf={m.senderId === currentUserId}
              conversationId={threadRef.conversationId}
            />
          ))
        )}
      </div>
      {typingPeers.length > 0 && (
        <p className="shrink-0 text-xs text-slate-500">
          {typingPeers.join(', ')} {t('chat.typing')}
        </p>
      )}
    </div>
  )
}

function MessageBubble({
  message,
  isSelf,
  conversationId,
}: {
  message: MessageDto
  isSelf: boolean
  conversationId: string | null
}) {
  const { t } = useTranslation()
  const [editMessage, editState] = useEditMessageMutation()
  const [deleteMessage, deleteState] = useDeleteMessageMutation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const trimmed = message.content?.trim() ?? ''
  const [draft, setDraft] = useState(() => trimmed)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  const attachments = message.attachments ?? []
  const audioItems = attachments.filter((a) => isAudioMime(a.mimeType))
  const imageItems = attachments.filter((a) => isImageMime(a.mimeType))
  const fileItems = attachments.filter((a) => !isAudioMime(a.mimeType) && !isImageMime(a.mimeType))
  const hasText = trimmed.length > 0
  const senderLabel =
    message.senderDisplayName?.trim() ||
    `${message.senderId.slice(0, 8)}…`
  const typeUpper = (message.type ?? '').toUpperCase()
  const canModify =
    Boolean(conversationId) &&
    isSelf &&
    !message.isDeleted &&
    typeUpper !== 'SYSTEM' &&
    typeUpper !== 'MISSEDCALL' &&
    typeUpper !== 'CALLENDED'
  const canEdit = canModify && hasText

  const submitEdit = async () => {
    if (!conversationId || !draft.trim()) return
    try {
      await editMessage({
        messageId: message.id,
        conversationId,
        content: draft.trim(),
      }).unwrap()
      setEditing(false)
      setMenuOpen(false)
    } catch {
      /* toast optional */
    }
  }

  const confirmDelete = async () => {
    if (!conversationId) return
    if (!window.confirm(t('chat.message.confirmUnsend'))) return
    try {
      await deleteMessage({ messageId: message.id, conversationId }).unwrap()
      setMenuOpen(false)
    } catch {
      /* optional */
    }
  }

  if (typeUpper === 'MISSEDCALL') {
    return (
      <div className="flex justify-center py-1.5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs text-red-600 ring-1 ring-red-100">
          <PhoneMissed className="h-3.5 w-3.5 shrink-0" />
          {isSelf
            ? t('chat.calls.missedCallSent')
            : t('chat.calls.missedCallReceived', {
                name: message.senderDisplayName?.trim() || senderLabel,
              })}
        </div>
      </div>
    )
  }

  if (typeUpper === 'CALLENDED') {
    return (
      <div className="flex justify-center py-1.5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          {t('chat.calls.callEnded')}
        </div>
      </div>
    )
  }

  if (message.isDeleted) {
    return (
      <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm italic ${
            isSelf ? 'bg-indigo-600/90 text-indigo-100' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {!isSelf && (
            <div className="mb-0.5 text-[10px] font-medium not-italic uppercase tracking-wide text-slate-500">
              {senderLabel}
            </div>
          )}
          {isSelf ? t('chat.message.removedSelf') : t('chat.message.removedOther')}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
          canModify && !editing ? 'pt-6' : ''
        } ${isSelf ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'}`}
        ref={menuRef}
      >
        {!isSelf && (
          <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            {senderLabel}
          </div>
        )}
        {canModify && !editing && (
          <div className="absolute right-1 top-1">
            <button
              type="button"
              className={`rounded p-0.5 ${isSelf ? 'text-indigo-200 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-200'}`}
              aria-expanded={menuOpen}
              aria-label={t('chat.message.actions')}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-10 mt-1 min-w-[9rem] rounded-lg border border-slate-200 bg-white py-1 text-left text-sm shadow-lg">
                {canEdit && (
                  <button
                    type="button"
                    className="block w-full px-3 py-1.5 text-left text-slate-800 hover:bg-slate-50"
                    onClick={() => {
                      setDraft(trimmed)
                      setEditing(true)
                      setMenuOpen(false)
                    }}
                  >
                    {t('chat.message.edit')}
                  </button>
                )}
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50"
                  disabled={deleteState.isLoading}
                  onClick={() => void confirmDelete()}
                >
                  {t('chat.message.unsend')}
                </button>
              </div>
            )}
          </div>
        )}
        {editing ? (
          <div className="space-y-2 pt-5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                onClick={() => {
                  setEditing(false)
                  setDraft(trimmed)
                }}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="rounded-lg bg-indigo-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                disabled={editState.isLoading || !draft.trim()}
                onClick={() => void submitEdit()}
              >
                {t('chat.message.saveEdit')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {audioItems.map((a) => {
              const audioSrc = resolveChatAssetUrl(a.fileUrl)
              return (
                <VoiceMessagePlayer key={`${message.id}-${audioSrc}`} src={audioSrc} isSelf={isSelf} />
              )
            })}
            {imageItems.map((a) => (
              <a
                key={`${message.id}-img-${a.fileUrl}`}
                href={resolveChatAssetUrl(a.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <img
                  src={resolveChatAssetUrl(a.fileUrl)}
                  alt=""
                  className="max-h-56 max-w-full rounded-lg object-cover"
                />
              </a>
            ))}
            {fileItems.map((a) => (
              <a
                key={`${message.id}-file-${a.fileUrl}`}
                href={resolveChatAssetUrl(a.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className={isSelf ? 'text-indigo-100 underline' : 'text-indigo-600 underline'}
              >
                {a.fileName || t('chat.attachment')}
              </a>
            ))}
            {hasText && <div className="whitespace-pre-wrap break-words">{trimmed}</div>}
          </div>
        )}
        <div className={`mt-1 flex flex-wrap items-center gap-x-2 text-[10px] ${isSelf ? 'text-indigo-100' : 'text-slate-400'}`}>
          <span>{new Date(message.sentAt).toLocaleString()}</span>
          {message.editedAt && (
            <span className="italic">{t('chat.message.editedLabel')}</span>
          )}
        </div>
      </div>
    </div>
  )
}

