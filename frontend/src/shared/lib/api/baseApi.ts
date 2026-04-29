import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQueryWithReauth'

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'ForumPost',
    'Comment',
    'Document',
    'Job',
    'Notification',
    'UserProfile',
  ],
  endpoints: () => ({}),
})
