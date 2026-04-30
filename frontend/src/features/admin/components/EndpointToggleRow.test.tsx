import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EndpointToggleRow } from './EndpointToggleRow'
import type { EndpointToggleDto } from '../types/admin.types'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (
        {
          'admin.togglesPage.row.disable': 'Disable',
          'admin.togglesPage.row.confirmDisable': 'Confirm disable',
          'admin.togglesPage.row.disableReason': 'Disable reason',
        } as Record<string, string>
      )[key] ?? key,
  }),
}))

function makeToggle(overrides?: Partial<EndpointToggleDto>): EndpointToggleDto {
  return {
    endpointKey: 'Api.Identity.AuthorizationAdmin.SetEndpointToggle',
    isEnabled: true,
    reason: null,
    updatedBy: 'admin-1',
    updatedAtUtc: '2026-04-30T00:00:00Z',
    version: 1,
    ...overrides,
  }
}

describe('EndpointToggleRow', () => {
  it('requires reason when disabling endpoint', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<EndpointToggleRow toggle={makeToggle()} isSubmitting={false} onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: 'Disable' }))
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirm disable' }))
    })
    expect(onSubmit).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText('Disable reason'), { target: { value: 'Maintenance window' } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Confirm disable' }))
    })
    expect(onSubmit).toHaveBeenCalledWith('Api.Identity.AuthorizationAdmin.SetEndpointToggle', false, 'Maintenance window')
  })
})
