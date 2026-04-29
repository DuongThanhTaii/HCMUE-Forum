import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import { logout, setTokensFromRefresh, setUserRoles } from '@features/auth/model/auth.slice'
import { parseRolesFromAccessToken } from '@features/auth/lib/token'
import type { RootState } from '../../../app/store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5034'

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

type RefreshTokenData = {
  accessToken?: string
  refreshToken?: string
}

type RefreshResponse = {
  accessToken: string
  refreshToken: string
}
let refreshPromise: Promise<RefreshResponse | null> | null = null

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const accessToken = (getState() as RootState).auth?.accessToken

    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`)
    }

    headers.set('content-type', 'application/json')
    return headers
  },
})

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status !== 401) {
    return result
  }

  const refreshToken = (api.getState() as RootState).auth?.refreshToken
  if (!refreshToken) {
    api.dispatch(logout())
    window.location.href = '/login'
    return result
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshResult = await rawBaseQuery(
        { url: '/api/v1/auth/refresh', method: 'POST', body: { refreshToken } },
        api,
        extraOptions
      )
      const envelope = refreshResult.data as ApiEnvelope<RefreshTokenData> | undefined
      const payload = envelope?.data
      const accessToken = payload?.accessToken?.trim()
      const nextRefreshToken = payload?.refreshToken?.trim()

      if (!accessToken || !nextRefreshToken) {
        return null
      }

      return { accessToken, refreshToken: nextRefreshToken }
    })().finally(() => {
      refreshPromise = null
    })
  }

  const nextAuth = await refreshPromise
  if (nextAuth) {
    api.dispatch(setTokensFromRefresh(nextAuth))
    const nextRoles = parseRolesFromAccessToken(nextAuth.accessToken)
    api.dispatch(setUserRoles(nextRoles))
    result = await rawBaseQuery(args, api, extraOptions)
  } else {
    api.dispatch(logout())
    window.location.href = '/login'
  }

  return result
}
