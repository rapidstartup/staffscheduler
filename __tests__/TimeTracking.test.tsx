import { render, screen, fireEvent } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import TimeTracking from '../app/components/TimeTracking'

jest.mock('next-auth/react')

describe('TimeTracking', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { id: '1', name: 'Test User' } }, 
      status: 'authenticated' 
    })
  })

  it('renders clock in button initially', () => {
    render(<TimeTracking />)
    expect(screen.getByText('Clock In')).toBeInTheDocument()
  })

  it('changes to clock out button after clocking in', () => {
    render(<TimeTracking />)
    fireEvent.click(screen.getByText('Clock In'))
    expect(screen.getByText('Clock Out')).toBeInTheDocument()
  })

  it('displays recent time entries', () => {
    render(<TimeTracking />)
    expect(screen.getByText('Recent Time Entries')).toBeInTheDocument()
    expect(screen.getByText(/2023-06-19/)).toBeInTheDocument()
    expect(screen.getByText(/2023-06-20/)).toBeInTheDocument()
  })
})

