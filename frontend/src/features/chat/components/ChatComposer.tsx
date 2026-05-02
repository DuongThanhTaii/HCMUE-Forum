import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useSendMessageMutation,
  useSendMessageWithAttachmentsMutation,
  useUploadChatFileMutation,
} from '../api/chat.api'
import { useChatContext } from '../context/ChatContext'
import { useTypingComposer } from '../hooks/useTypingComposer'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import { enqueueOutbox, openOutboxDb } from '../lib/outboxDb'
import { getRtkQueryErrorMessage } from '../lib/rtkErrorMessage'
import { drainChatOutbox } from '../lib/processOutbox'
import type { ChatThreadRef } from '../types/chat.types'
import { useAppSelector } from '@shared/hooks/useAppSelector'

function fileExtForAudioMime(mime: string): string {
  if (mime.includes('mp4') || mime.includes('m4a') || mime.includes('aac')) return 'm4a'
  if (mime.includes('ogg')) return 'ogg'
  return 'webm'
}

function formatUploadError(t: (k: string) => string, err: unknown, hasToken: boolean): string {
  const msg = getRtkQueryErrorMessage(err)
  if (msg) return msg
  if (!hasToken) return t('chat.uploadNeedLogin')
  return t('chat.uploadError')
}

export function ChatComposer({ threadRef }: { threadRef: ChatThreadRef }) {
  const { t } = useTranslation()
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const { sendTyping, sendChannelMessage } = useChatContext()
  const [text, setText] = useState('')
  const [sendMessage] = useSendMessageMutation()
  const [uploadFile] = useUploadChatFileMutation()
  const [sendAttachments] = useSendMessageWithAttachmentsMutation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const voice = useVoiceRecorder()

  const conversationId = threadRef.kind === 'conversation' ? threadRef.conversationId : null
  const hasToken = Boolean(accessToken?.trim())

  const { onComposerChange, flushStop } = useTypingComposer({
    enabled: threadRef.kind === 'conversation',
    conversationId,
    sendTyping,
  })

  const handleChange = (v: string) => {
    setText(v)
    onComposerChange(v)
  }

  const sendWithOutboxFallback = useCallback(
    async (content: string) => {
      if (threadRef.kind !== 'conversation') return
      try {
        await sendMessage({
          conversationId: threadRef.conversationId,
          content,
        }).unwrap()
        await drainChatOutbox()
      } catch {
        const db = await openOutboxDb()
        const id = crypto.randomUUID()
        const enq = await enqueueOutbox(db, {
          id,
          conversationId: threadRef.conversationId,
          body: { type: 'text', content },
          attempts: 0,
          createdAt: Date.now(),
        })
        if (enq === 'full') {
          window.alert(t('chat.outbox.full'))
        }
      }
    },
    [sendMessage, t, threadRef]
  )

  const submitText = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    flushStop()
    setText('')
    if (threadRef.kind === 'channel') {
      await sendChannelMessage(threadRef.channelId, trimmed)
      return
    }
    if (!navigator.onLine) {
      const db = await openOutboxDb()
      const id = crypto.randomUUID()
      const enq = await enqueueOutbox(db, {
        id,
        conversationId: threadRef.conversationId,
        body: { type: 'text', content: trimmed },
        attempts: 0,
        createdAt: Date.now(),
      })
      if (enq === 'full') {
        window.alert(t('chat.outbox.full'))
      }
      return
    }
    await sendWithOutboxFallback(trimmed)
  }

  const onPickFile = async (files: FileList | null) => {
    if (!files?.length || threadRef.kind !== 'conversation') return
    if (!hasToken) {
      window.alert(t('chat.uploadNeedLogin'))
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    const file = files[0]
    flushStop()
    const fd = new FormData()
    fd.append('file', file, file.name)
    try {
      const up = await uploadFile(fd).unwrap()
      await sendAttachments({
        conversationId: threadRef.conversationId,
        content: text.trim() || null,
        attachments: [
          {
            fileName: up.fileName,
            fileUrl: up.fileUrl,
            fileSize: up.fileSize,
            mimeType: up.contentType,
            thumbnailUrl: null,
          },
        ],
      }).unwrap()
      setText('')
    } catch (e) {
      window.alert(formatUploadError(t, e, hasToken))
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const sendVoiceIfReady = async () => {
    const recorded = voice.blob
    if (!recorded || threadRef.kind !== 'conversation') return
    if (!hasToken) {
      window.alert(t('chat.uploadNeedLogin'))
      return
    }
    const mime = recorded.type || voice.lastMime || 'audio/webm'
    const ext = fileExtForAudioMime(mime)
    const file = new File([recorded], `voice-${Date.now()}.${ext}`, { type: mime })
    voice.reset()
    const fd = new FormData()
    fd.append('file', file, file.name)
    try {
      const up = await uploadFile(fd).unwrap()
      await sendAttachments({
        conversationId: threadRef.conversationId,
        content: null,
        attachments: [
          {
            fileName: up.fileName,
            fileUrl: up.fileUrl,
            fileSize: up.fileSize,
            mimeType: up.contentType,
            thumbnailUrl: null,
          },
        ],
      }).unwrap()
    } catch (e) {
      window.alert(formatUploadError(t, e, hasToken))
    }
  }

  return (
    <div className="space-y-2 border-t border-slate-200 pt-3">
      {voice.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-800">
          {voice.error === 'VOICE_EMPTY' ? t('chat.voice.empty') : voice.error}
        </p>
      )}

      {voice.state === 'recording' && (
        <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm">
          <span>
            {t('chat.voice.recording')} · {voice.seconds}s
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
              onClick={() => {
                voice.cancelRecording()
              }}
            >
              {t('chat.voice.discard')}
            </button>
            <button
              type="button"
              className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white"
              onClick={() => {
                voice.finishRecording()
              }}
            >
              {t('chat.voice.stop')}
            </button>
          </div>
        </div>
      )}

      {voice.state === 'stopped' && voice.blob && threadRef.kind === 'conversation' && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <span>{t('chat.voice.preview')}</span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
              onClick={() => voice.reset()}
            >
              {t('chat.voice.discard')}
            </button>
            <button
              type="button"
              className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white"
              onClick={() => void sendVoiceIfReady()}
            >
              {t('chat.voice.send')}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2">
        {threadRef.kind === 'conversation' && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => void onPickFile(e.target.files)}
            />
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-2 py-2 text-xs text-slate-700"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('chat.attachFile')}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-2 py-2 text-xs text-slate-700"
              onClick={() => void voice.start()}
              disabled={voice.state !== 'idle'}
            >
              {t('chat.voice.start')}
            </button>
          </>
        )}
        <textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => flushStop()}
          placeholder={t('chat.typeMessage')}
          rows={2}
          className="min-h-[44px] flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
        />
        <button
          type="button"
          onClick={() => void submitText()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t('chat.send')}
        </button>
      </div>
    </div>
  )
}
