import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import TimeTracking from '@/components/TimeTracking'

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: '1', name: 'Test User' } },
    status: 'authenticated',
  })),
}))

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock

describe('TimeTracking', () => {
  it('renders the time tracking component', () => {
    render(
      <SessionProvider session={null}>
        <TimeTracking />
      </SessionProvider>
    )
    expect(screen.getByText('Time Tracking')).toBeInTheDocument()
  })

  it('allows clocking in and out', async () => {
    render(
      <SessionProvider session={null}>
        <TimeTracking />
      </SessionProvider>
    )
    
    const clockInButton = screen.getByText('Clock In')
    fireEvent.click(clockInButton)
    
    await waitFor(() => {
      expect(screen.getByText('Clock Out')).toBeInTheDocument()
    })
    
    const clockOutButton = screen.getByText('Clock Out')
    fireEvent.click(clockOutButton)
    
    await waitFor(() => {
      expect(screen.getByText('Clock In')).toBeInTheDocument()
    })
  })

  it('displays recent time entries', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: '1', startTime: '2023-06-01T09:00:00Z', endTime: '2023-06-01T17:00:00Z' },
          { id: '2', startTime: '2023-06-02T09:00:00Z', endTime: '2023-06-02T17:00:00Z' },
        ]),
      })
    ) as jest.Mock

    render(
      <SessionProvider session={null}>
        <TimeTracking />
      </SessionProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Recent Time Entries')).toBeInTheDocument()
      expect(screen.getByText('June 1, 2023')).toBeInTheDocument()
      expect(screen.getByText('June 2, 2023')).toBeInTheDocument()
    })
  })
})

