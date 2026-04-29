const ROLE_CLAIM_KEYS = [
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role',
]

type JwtPayload = Record<string, unknown>

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return atob(padded)
}

export function parseRolesFromAccessToken(accessToken: string): string[] {
  try {
    const parts = accessToken.split('.')
    if (parts.length < 2) {
      return []
    }

    const payload = JSON.parse(decodeBase64Url(parts[1])) as JwtPayload
    const roles = ROLE_CLAIM_KEYS.flatMap((key) => {
      const value = payload[key]
      if (typeof value === 'string') {
        return value.trim() ? [value.trim()] : []
      }
      if (Array.isArray(value)) {
        return value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
      }
      return []
    })

    return Array.from(new Set(roles))
  } catch {
    return []
  }
}
