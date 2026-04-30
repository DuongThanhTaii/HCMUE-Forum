import * as React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminUsersPage } from './AdminUsersPage'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('../hooks/useAdminUsersPage', () => {
  return {
    useAdminUsersPage: () => {
      const users = [
        {
          id: 'u-1',
          fullName: 'Alice Nguyen',
          email: 'alice@hcmue.edu.vn',
          status: 'Active',
          roles: [{ id: 'r-admin', name: 'Admin' }],
          badge: null,
        },
        {
          id: 'u-2',
          fullName: 'Bob Tran',
          email: 'bob@hcmue.edu.vn',
          status: 'Inactive',
          roles: [{ id: 'r-mod', name: 'Moderator' }],
          badge: null,
        },
      ]

      const [searchValue, setSearchValue] = React.useState('')
      const [roleFilter, setRoleFilter] = React.useState('all')
      const [statusFilter, setStatusFilter] = React.useState('all')
      const [assignRoleUserId, setAssignRoleUserId] = React.useState<string | null>(null)
      const [submissions, setSubmissions] = React.useState<string[]>([])

      const filteredUsers = users.filter((user) => {
        const bySearch =
          !searchValue ||
          user.fullName.toLowerCase().includes(searchValue.toLowerCase()) ||
          user.email.toLowerCase().includes(searchValue.toLowerCase())
        const byRole = roleFilter === 'all' || user.roles.some((role) => role.id === roleFilter)
        const byStatus = statusFilter === 'all' || user.status === statusFilter
        return bySearch && byRole && byStatus
      })

      return {
        t: (key: string) => key,
        users: filteredUsers,
        roleOptions: [
          { value: 'all', label: 'All roles' },
          { value: 'r-admin', label: 'Admin' },
          { value: 'r-mod', label: 'Moderator' },
        ],
        statusOptions: [
          { value: 'all', label: 'All statuses' },
          { value: 'Active', label: 'Active' },
          { value: 'Inactive', label: 'Inactive' },
        ],
        isLoading: false,
        isError: false,
        searchValue,
        roleFilter,
        statusFilter,
        assignRoleUserId,
        assignBadgeUserId: null,
        selectedUserForAssignRole: users.find((user) => user.id === assignRoleUserId) ?? null,
        selectedUserForAssignBadge: null,
        isAssignRoleSubmitting: false,
        isAssignBadgeSubmitting: false,
        setSearchValue,
        setRoleFilter,
        setStatusFilter,
        openAssignRoleModal: (userId: string) => setAssignRoleUserId(userId),
        closeAssignRoleModal: () => setAssignRoleUserId(null),
        openAssignBadgeModal: vi.fn(),
        closeAssignBadgeModal: vi.fn(),
        submitAssignRole: async ({ roleId }: { roleId: string }) => {
          setSubmissions((prev) => [...prev, roleId])
          setAssignRoleUserId(null)
        },
        submitAssignBadge: vi.fn(),
        removeUserRole: vi.fn(),
        removeUserBadge: vi.fn(),
        _submissions: submissions,
      }
    },
  }
})

describe('AdminUsersPage', () => {
  it('supports controlled filters and assign role flow', async () => {
    render(<AdminUsersPage />)

    const searchInput = screen.getByLabelText('admin.usersPage.filters.search')
    fireEvent.change(searchInput, { target: { value: 'alice' } })
    expect(screen.getByText('Alice Nguyen')).toBeInTheDocument()
    expect(screen.queryByText('Bob Tran')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('admin.usersPage.filters.role'), {
      target: { value: 'r-admin' },
    })
    expect(screen.getByText('Alice Nguyen')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('admin.usersPage.filters.status'), {
      target: { value: 'Active' },
    })
    expect(screen.getByText('Alice Nguyen')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'admin.usersPage.actions.assignRole' }))
    expect(screen.getByRole('heading', { name: 'admin.usersPage.assignRoleModal.title' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('admin.usersPage.assignRoleModal.role'), {
      target: { value: 'r-admin' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'common.submit' }))
    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: 'admin.usersPage.assignRoleModal.title' }),
      ).not.toBeInTheDocument()
    })
  })
})
