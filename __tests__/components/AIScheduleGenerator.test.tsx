import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { NotificationProvider } from '@/app/contexts/NotificationContext'
import AIScheduleGenerator from '@/components/AIScheduleGenerator'

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

describe('AIScheduleGenerator', () => {
  it('renders the AI schedule generator for managers', () => {
    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <AIScheduleGenerator />
        </NotificationProvider>
      </SessionProvider>
    )

    expect(screen.getByText('AI Schedule Generator')).toBeInTheDocument()
    expect(screen.getByLabelText('Par Hours')).toBeInTheDocument()
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
    expect(screen.getByLabelText('End Date')).toBeInTheDocument()
    expect(screen.getByText('Generate Schedule')).toBeInTheDocument()
  })

  it('generates a schedule when the form is submitted', async () => {
    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <AIScheduleGenerator />
        </NotificationProvider>
      </SessionProvider>
    )

    fireEvent.change(screen.getByLabelText('Par Hours'), { target: { value: '40' } })
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2023-07-01' } })
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2023-07-07' } })

    fireEvent.click(screen.getByText('Generate Schedule'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/generate-schedule', expect.any(Object))
    })
  })

  it('displays the generated schedule and deploy button', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { userId: '1', date: '2023-07-01', startTime: '09:00', endTime: '17:00' },
          { userId: '2', date: '2023-07-02', startTime: '10:00', endTime: '18:00' },
        ]),
      })
    ) as jest.Mock

    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <AIScheduleGenerator />
        </NotificationProvider>
      </SessionProvider>
    )

    fireEvent.click(screen.getByText('Generate Schedule'))

    await waitFor(() => {
      expect(screen.getByText('Generated Schedule')).toBeInTheDocument()
      expect(screen.getByText('Deploy Schedule')).toBeInTheDocument()
    })
  })

  it('deploys the generated schedule', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Schedule deployed successfully' }),
      })
    ) as jest.Mock

    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <AIScheduleGenerator />
        </NotificationProvider>
      </SessionProvider>
    )

    fireEvent.click(screen.getByText('Generate Schedule'))

    await waitFor(() => {
      expect(screen.getByText('Deploy Schedule')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Deploy Schedule'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/deploy-schedule', expect.any(Object))
    })
  })
})

