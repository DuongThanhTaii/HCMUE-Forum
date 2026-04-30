import { describe, expect, it } from 'vitest'
import {
  buildRevokeUserOverrideRequest,
  buildUpsertUserOverrideRequest,
  getGroupOverridesPath,
  getUserOverridesPath,
} from './admin.api'

describe('admin overrides endpoints (A4)', () => {
  it('defines getUserOverrides endpoint at /api/v1/admin/authorization/users/{userId}/overrides', () => {
    expect(getUserOverridesPath('u1')).toBe('/api/v1/admin/authorization/users/u1/overrides')
  })

  it('defines upsertUserOverride payload route and body', () => {
    expect(
      buildUpsertUserOverrideRequest('u1', {
        permissionId: 'p1',
        scopeType: 'Global',
        scopeValue: null,
        effect: 'Deny',
        reason: 'block',
        expiresAtUtc: null,
      }),
    ).toEqual({
      url: '/api/v1/admin/authorization/users/u1/overrides',
      method: 'POST',
      body: {
        permissionId: 'p1',
        scopeType: 'Global',
        scopeValue: '',
        effect: 'Deny',
        reason: 'block',
        expiresAtUtc: null,
      },
    })
  })

  it('defines revokeUserOverride route with required query params', () => {
    expect(
      buildRevokeUserOverrideRequest('u1', {
        permissionId: 'p1',
        scopeType: 'Global',
        scopeValue: null,
      }),
    ).toEqual({
      url: '/api/v1/admin/authorization/users/u1/overrides',
      method: 'DELETE',
      params: {
        permissionId: 'p1',
        scopeType: 'Global',
        scopeValue: '',
      },
    })
  })

  it('defines group override route helper for group tab support', () => {
    expect(getGroupOverridesPath('g1')).toBe('/api/v1/admin/authorization/groups/g1/overrides')
  })
})
