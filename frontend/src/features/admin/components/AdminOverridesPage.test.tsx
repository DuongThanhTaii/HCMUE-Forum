import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AdminOverridesPage } from './AdminOverridesPage'

const mockHookResult = {
  t: (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
  activeTab: 'users' as const,
  setActiveTab: vi.fn(),
  searchValue: '',
  setSearchValue: vi.fn(),
  selectedUserId: null,
  setSelectedUserId: vi.fn(),
  selectedUser: null,
  filteredUsers: [],
  permissions: [],
  overrides: [],
  isOverridesLoading: false,
  isMutating: false,
  submitUserOverride: vi.fn(),
  revokeOverride: vi.fn(),
  isError: false,
  isGroupSourceAvailable: false,
}

vi.mock('../hooks/useAdminOverridesPage', () => ({
  useAdminOverridesPage: () => mockHookResult,
}))

describe('AdminOverridesPage', () => {
  it('renders per-user panel by default and switches to group placeholder', () => {
    render(
      <MemoryRouter>
        <AdminOverridesPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Select a user to manage overrides.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Per Group' }))
    expect(mockHookResult.setActiveTab).toHaveBeenCalledWith('groups')
  })
})
