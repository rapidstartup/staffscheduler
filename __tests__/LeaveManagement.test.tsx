import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import LeaveManagement from '../app/components/LeaveManagement'

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock

describe('LeaveManagement', () => {
  it('renders the leave management form', () => {
    render(
      <SessionProvider session={null}>
        <LeaveManagement />
      </SessionProvider>
    )
    expect(screen.getByText('Leave Management')).toBeInTheDocument()
    expect(screen.getByText('Submit Request')).toBeInTheDocument()
  })

  it('submits a leave request', async () => {
    render(
      <SessionProvider session={null}>
        <LeaveManagement />
      </SessionProvider>
    )
    
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2023-07-01' } })
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2023-07-05' } })
    fireEvent.change(screen.getByLabelText('Leave Type'), { target: { value: 'vacation' } })
    
    fireEvent.click(screen.getByText('Submit Request'))
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/leave-requests', expect.any(Object))
    })
  })
})

