import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useAdminUsersPage } from './useAdminUsersPage'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const mockUseGetUsersQuery = vi.fn()
const mockUseGetRolesQuery = vi.fn()
const mockAssignRoleMutation = vi.fn()
const mockAssignBadgeMutation = vi.fn()
const mockRemoveBadgeMutation = vi.fn()

vi.mock('../api/admin.api', () => ({
  useGetUsersQuery: () => mockUseGetUsersQuery(),
  useGetRolesQuery: () => mockUseGetRolesQuery(),
  useAssignRoleToUserMutation: () => mockAssignRoleMutation(),
  useAssignBadgeMutation: () => mockAssignBadgeMutation(),
  useRemoveBadgeMutation: () => mockRemoveBadgeMutation(),
}))

describe('useAdminUsersPage', () => {
  it('keeps users visible when role filter is selected without role membership data', () => {
    mockUseGetUsersQuery.mockReturnValue({
      data: [
        {
          id: 'u-1',
          email: 'alice@hcmue.edu.vn',
          fullName: 'Alice Nguyen',
          bio: null,
          status: 'Active',
          badge: null,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
      isLoading: false,
      isError: false,
    })
    mockUseGetRolesQuery.mockReturnValue({
      data: [
        {
          id: 'r-admin',
          name: 'Admin',
          description: '',
          isDefault: false,
          isSystemRole: true,
          permissionCount: 0,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
      isLoading: false,
      isError: false,
    })
    mockAssignRoleMutation.mockReturnValue([vi.fn(), { isLoading: false }])
    mockAssignBadgeMutation.mockReturnValue([vi.fn(), { isLoading: false }])
    mockRemoveBadgeMutation.mockReturnValue([vi.fn()])

    const { result } = renderHook(() => useAdminUsersPage())
    expect(result.current.canFilterByRole).toBe(false)
    expect(result.current.users).toHaveLength(1)

    act(() => {
      result.current.setRoleFilter('r-admin')
    })

    expect(result.current.roleFilter).toBe('all')
    expect(result.current.users).toHaveLength(1)
  })
})
