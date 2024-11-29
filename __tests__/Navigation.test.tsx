import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import Navigation from '../app/components/Navigation'

jest.mock('next-auth/react')

describe('Navigation', () => {
  it('renders login link when not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' })
    render(<Navigation />)
    expect(screen.getByText('Log In')).toBeInTheDocument()
  })

  it('renders dashboard and logout links when authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { name: 'Test User' } }, 
      status: 'authenticated' 
    })
    render(<Navigation />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Log Out')).toBeInTheDocument()
  })
})

