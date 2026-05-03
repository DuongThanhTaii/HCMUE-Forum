import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import * as signalR from '@microsoft/signalr'
import { useAppSelector } from '@shared/hooks/useAppSelector'
import { baseApi } from '@shared/lib/api/baseApi'
import { useAppDispatch } from '@shared/hooks/useAppDispatch'

const NOTIFICATION_HUB_URL = `${(import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:5034'}/hubs/notifications`

export type LiveNotification = {
  id: string
  title: string
  message: string
  type: string
  createdAt: string
  isRead: boolean
  actionUrl?: string | null
}

type NotificationContextValue = {
  unreadCount: number
  liveItems: LiveNotification[]
  clearLive: (id: string) => void
  clearAllLive: () => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAppSelector((s) => s.auth.accessToken)
  const dispatch = useAppDispatch()
  const [unreadCount, setUnreadCount] = useState(0)
  const [liveItems, setLiveItems] = useState<LiveNotification[]>([])
  const connRef = useRef<signalR.HubConnection | null>(null)

  const invalidateNotifications = useCallback(() => {
    dispatch(
      baseApi.util.invalidateTags([
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD_COUNT' },
      ]),
    )
  }, [dispatch])

  useEffect(() => {
    if (!accessToken) {
      void connRef.current?.stop().catch(() => undefined)
      connRef.current = null
      return
    }

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(NOTIFICATION_HUB_URL, {
        accessTokenFactory: async () => accessToken,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10_000])
      .build()

    connRef.current = conn

    conn.on('receiveNotification', (payload: unknown) => {
      const p = payload as { id: string; title: string; message: string; type: string; createdAt: string }
      startTransition(() => {
        setLiveItems((prev) => [
          { id: p.id, title: p.title, message: p.message, type: p.type, createdAt: p.createdAt, isRead: false },
          ...prev.slice(0, 49),
        ])
      })
      invalidateNotifications()
    })

    conn.on('unreadCountUpdated', (count: number) => {
      startTransition(() => setUnreadCount(count))
      invalidateNotifications()
    })

    void conn.start().catch(() => undefined)

    return () => {
      conn.off('receiveNotification')
      conn.off('unreadCountUpdated')
      void conn.stop().catch(() => undefined)
      connRef.current = null
    }
  }, [accessToken, invalidateNotifications])

  const clearLive = useCallback((id: string) => {
    setLiveItems((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const clearAllLive = useCallback(() => setLiveItems([]), [])

  return (
    <NotificationContext.Provider value={{ unreadCount, liveItems, clearLive, clearAllLive }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotificationContext must be inside NotificationProvider')
  return ctx
}
