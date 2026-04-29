import { describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { AdminGuard } from './guards/AdminGuard'

const mockedUseAppSelector = vi.fn()

vi.mock('@features/auth/context/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}))

vi.mock('@shared/hooks/useAppSelector', () => ({
  useAppSelector: (selector: unknown) => mockedUseAppSelector(selector),
}))

describe('admin route guard contract', () => {
  it('redirects non-admin from /admin/users to /home', async () => {
    mockedUseAppSelector.mockReturnValue(['Student'])

    const router = createMemoryRouter(
      [
        { path: '/home', element: <div>Home page</div> },
        {
          path: '/admin',
          element: <AdminGuard />,
          children: [{ path: 'users', element: <div>Admin users page</div> }],
        },
      ],
      { initialEntries: ['/admin/users'] },
    )

    render(<RouterProvider router={router} />)

    await screen.findByText('Home page')
    expect(router.state.location.pathname).toBe('/home')
  })
})
