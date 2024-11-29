import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { NotificationProvider } from '@/app/contexts/NotificationContext'
import RecurringShiftManager from '@/components/RecurringShiftManager'

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: '1', name: 'Test User', role: 'manager' } },
    status: 'authenticated',
  })),
}))

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock

describe('RecurringShiftManager', () => {
  it('renders the recurring shift manager for managers', () => {
    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <RecurringShiftManager />
        </NotificationProvider>
      </SessionProvider>
    )

    expect(screen.getByText('Recurring Shift Manager')).toBeInTheDocument()
    expect(screen.getByText('Create and manage recurring shifts')).toBeInTheDocument()
    expect(screen.getByText('Create Recurring Shift')).toBeInTheDocument()
  })

  it('allows creating a new recurring shift', async () => {
    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <RecurringShiftManager />
        </NotificationProvider>
      </SessionProvider>
    )

    fireEvent.change(screen.getByLabelText('Employee'), { target: { value: 'employee1' } })
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: '09:00' } })
    fireEvent.change(screen.getByLabelText('End Time'), { target: { value: '17:00' } })
    fireEvent.click(screen.getByLabelText('Monday'))
    fireEvent.click(screen.getByLabelText('Wednesday'))
    fireEvent.click(screen.getByLabelText('Friday'))
    fireEvent.change(screen.getByLabelText('Frequency'), { target: { value: 'weekly' } })
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2023-12-31' } })

    fireEvent.click(screen.getByText('Create Recurring Shift'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/recurring-shifts', expect.any(Object))
    })
  })

  it('displays existing recurring shifts', async () => {
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
      <SessionProvider session={null}>
        <NotificationProvider>
          <RecurringShiftManager />
        </NotificationProvider>
      </SessionProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Existing Recurring Shifts')).toBeInTheDocument()
      expect(screen.getByText('Employee: employee1')).toBeInTheDocument()
      expect(screen.getByText('Time: 09:00 - 17:00')).toBeInTheDocument()
      expect(screen.getByText('Days: Monday, Wednesday, Friday')).toBeInTheDocument()
      expect(screen.getByText('Frequency: weekly')).toBeInTheDocument()
      expect(screen.getByText('End Date: 2023-12-31')).toBeInTheDocument()
    })
  })

  it('allows deleting a recurring shift', async () => {
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
      <SessionProvider session={null}>
        <NotificationProvider>
          <RecurringShiftManager />
        </NotificationProvider>
      </SessionProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/recurring-shifts/1', expect.any(Object))
    })
  })
})

