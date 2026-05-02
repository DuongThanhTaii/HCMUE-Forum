import { MonitorUp, Phone, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ChatThreadRef } from '../types/chat.types'

type Props = {
  threadRef: ChatThreadRef
}

/**
 * Gọi video / chia sẻ màn hình cần WebRTC + tín hiệu (STUN/TURN) + UI riêng — chưa triển khai;
 * nơi tập hợp CTA theo hướng sản phẩm, tránh hứa tính năng sẵn sàng.
 */
export function ChatCallBar({ threadRef }: Props) {
  const { t } = useTranslation()
  if (threadRef.kind !== 'conversation') return null

  const onSoon = () => {
    window.alert(t('chat.calls.comingSoonDetail'))
  }

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onSoon}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
        title={t('chat.calls.comingSoon')}
      >
        <Phone className="h-3.5 w-3.5" aria-hidden />
        {t('chat.calls.voice')}
      </button>
      <button
        type="button"
        onClick={onSoon}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
        title={t('chat.calls.comingSoon')}
      >
        <Video className="h-3.5 w-3.5" aria-hidden />
        {t('chat.calls.video')}
      </button>
      <button
        type="button"
        onClick={onSoon}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
        title={t('chat.calls.comingSoon')}
      >
        <MonitorUp className="h-3.5 w-3.5" aria-hidden />
        {t('chat.calls.screen')}
      </button>
    </div>
  )
}
