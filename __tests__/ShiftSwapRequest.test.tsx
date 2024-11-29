import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { NotificationProvider } from '../app/contexts/NotificationContext'
import ShiftSwapRequest from '../app/components/ShiftSwapRequest'

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { id: '1', date: '2023-06-01', startTime: '09:00', endTime: '17:00' },
      { id: '2', date: '2023-06-02', startTime: '10:00', endTime: '18:00' },
    ]),
  })
) as jest.Mock

describe('ShiftSwapRequest', () => {
  it('renders the shift swap request form', async () => {
    render(
      <SessionProvider session={{ user: { id: '1', name: 'Test User' } }}>
        <NotificationProvider>
          <ShiftSwapRequest />
        </NotificationProvider>
      </SessionProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Request Shift Swap')).toBeInTheDocument()
      expect(screen.getByLabelText('Select Shift to Swap')).toBeInTheDocument()
      expect(screen.getByLabelText('Reason for Swap')).toBeInTheDocument()
      expect(screen.getByText('Submit Shift Swap Request')).toBeInTheDocument()
    })
  })

  it('submits a shift swap request', async () => {
    render(
      <SessionProvider session={{ user: { id: '1', name: 'Test User' } }}>
        <NotificationProvider>
          <ShiftSwapRequest />
        </NotificationProvider>
      </SessionProvider>
    )

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Select Shift to Swap'), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText('Reason for Swap'), { target: { value: 'Personal appointment' } })
    })

    fireEvent.click(screen.getByText('Submit Shift Swap Request'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/shift-swap-requests', expect.any(Object))
    })
  })

  it('displays an error message when submission fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as jest.Mock

    render(
      <SessionProvider session={{ user: { id: '1', name: 'Test User' } }}>
        <NotificationProvider>
          <ShiftSwapRequest />
        </NotificationProvider>
      </SessionProvider>
    )

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Select Shift to Swap'), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText('Reason for Swap'), { target: { value: 'Personal appointment' } })
    })

    fireEvent.click(screen.getByText('Submit Shift Swap Request'))

    await waitFor(() => {
      expect(screen.getByText('Failed to submit shift swap request')).toBeInTheDocument()
    })
  })
})

