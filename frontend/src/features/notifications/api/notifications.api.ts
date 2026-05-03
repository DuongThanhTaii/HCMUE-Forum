import { baseApi } from '@shared/lib/api/baseApi'

export type NotificationDto = {
  id: string
  subject: string
  body: string
  actionUrl: string | null
  iconUrl: string | null
  status: string
  channel: string
  createdAt: string
  readAt: string | null
  isRead: boolean
}

type GetNotificationsResponse = {
  notifications: NotificationDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getNotifications: b.query<GetNotificationsResponse, { pageNumber?: number; pageSize?: number }>({
      query: ({ pageNumber = 1, pageSize = 20 } = {}) =>
        `/notifications?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      transformResponse: (r: { data: GetNotificationsResponse }) => r.data,
      providesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
    getUnreadCount: b.query<number, void>({
      query: () => '/notifications/unread-count',
      transformResponse: (r: { data: { count: number } }) => r.data.count,
      providesTags: [{ type: 'Notification', id: 'UNREAD_COUNT' }],
    }),
    markAsRead: b.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }, { type: 'Notification', id: 'UNREAD_COUNT' }],
    }),
    markAllAsRead: b.mutation<void, void>({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }, { type: 'Notification', id: 'UNREAD_COUNT' }],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationsApi
