import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { NotificationProvider } from '../app/contexts/NotificationContext'
import RecurringShiftManager from '../app/components/RecurringShiftManager'

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock

describe('RecurringShiftManager', () => {
  it('renders the recurring shift manager for managers', () => {
    render(
      <SessionProvider session={{ user: { role: 'manager' } }}>
        <NotificationProvider>
          <RecurringShiftManager />
        </NotificationProvider>
      </SessionProvider>
    )

    expect(screen.getByText('Recurring Shift Manager')).toBeInTheDocument()
    expect(screen.getByText('Create and manage recurring shifts')).toBeInTheDocument()
    expect(screen.getByText('Create Recurring Shift')).toBeInTheDocument()
  })

  it('does not render for non-manager users', () => {
    render(
      <SessionProvider session={{ user: { role: 'employee' } }}>
        <NotificationProvider>
          <RecurringShiftManager />
        </NotificationProvider>
      </SessionProvider>
    )

    expect(screen.queryByText('Recurring Shift Manager')).not.toBeInTheDocument()
  })

  it('creates a recurring shift when the form is submitted', async () => {
    render(
      <SessionProvider session={{ user: { role: 'manager' } }}>
        <NotificationProvider>
          <RecurringShiftManager />
        </NotificationProvider>
      </SessionProvider>
    )

    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: '09:00' } })
    fireEvent.change(screen.getByLabelText('End Time'), { target: { value: '17:00' } })
    fireEvent.click(screen.getByLabelText('Monday'))
    fireEvent.click(screen.getByLabelText('Wednesday'))
    fireEvent.click(screen.getByLabelText('Friday'))
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2023-12-31' } })

    fireEvent.click(screen.getByText('Create Recurring Shift'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/recurring-shifts', expect.any(Object))
    })
  })

  it('deletes a recurring shift when the delete button is clicked', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: '1',
            userId: 'employee1',
            startTime: '09:00',
            endTime: '17:00',
            recurringDays: [1, 3, 5],
            recurringFrequency: 'weekly',
            recurringEndDate: '2023-12-31',
          },
        ]),
      })
    ) as jest.Mock

    render(
      <SessionProvider session={{ user: { role: 'manager' } }}>
        <NotificationProvider>
          <RecurringShiftManager />
        </NotificationProvider>
      </SessionProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Existing Recurring Shifts')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/recurring-shifts/1', expect.any(Object))
    })
  })
})

