import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminUsersPage } from '../components/AdminUsersPage'

const mockHookResult = {
  t: (key: string) => key,
  users: [
    {
      id: 'u-1',
      fullName: 'Alice Nguyen',
      email: 'alice@hcmue.edu.vn',
      status: 'Active',
      badge: null,
    },
  ],
  roleOptions: [
    { value: 'all', label: 'All roles' },
    { value: 'r-admin', label: 'Admin' },
  ],
  statusOptions: [
    { value: 'all', label: 'All statuses' },
    { value: 'Active', label: 'Active' },
  ],
  searchValue: '',
  roleFilter: 'all',
  statusFilter: 'all',
  assignRoleUserId: null,
  assignBadgeUserId: null,
  selectedUserForAssignRole: null,
  selectedUserForAssignBadge: null,
  isAssignRoleSubmitting: false,
  isAssignBadgeSubmitting: false,
  isLoading: false,
  isError: false,
  canFilterByRole: false,
  setSearchValue: vi.fn(),
  setRoleFilter: vi.fn(),
  setStatusFilter: vi.fn(),
  openAssignRoleModal: vi.fn(),
  closeAssignRoleModal: vi.fn(),
  openAssignBadgeModal: vi.fn(),
  closeAssignBadgeModal: vi.fn(),
  submitAssignRole: vi.fn(),
  submitAssignBadge: vi.fn(),
  removeUserBadge: vi.fn(),
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('../hooks/useAdminUsersPage', () => {
  return {
    useAdminUsersPage: () => mockHookResult,
  }
})

describe('AdminUsersPage', () => {
  it('renders users table and delegates row action handlers', () => {
    render(<AdminUsersPage />)

    expect(screen.getByText('Alice Nguyen')).toBeInTheDocument()
    expect(screen.getByLabelText('admin.usersPage.filters.role')).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'admin.usersPage.actions.assignRole' }))
    expect(mockHookResult.openAssignRoleModal).toHaveBeenCalledWith('u-1')
  })
})
