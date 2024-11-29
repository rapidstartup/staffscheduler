import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { NotificationProvider } from '@/app/contexts/NotificationContext'
import ReportingDashboard from '@/components/ReportingDashboard'

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: '1', name: 'Test User', role: 'manager' } },
    status: 'authenticated',
  })),
}))

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      labels: ['Employee 1', 'Employee 2'],
      datasets: [
        {
          label: 'Hours Worked',
          data: [40, 35],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    }),
  })
) as jest.Mock

jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
  Line: () => <div data-testid="line-chart" />,
}))

describe('ReportingDashboard', () => {
  it('renders the reporting dashboard for managers', () => {
    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <ReportingDashboard />
        </NotificationProvider>
      </SessionProvider>
    )

    expect(screen.getByText('Reporting Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Generate and view reports')).toBeInTheDocument()
    expect(screen.getByText('Report Type')).toBeInTheDocument()
    expect(screen.getByText('Date Range')).toBeInTheDocument()
    expect(screen.getByText('Generate Report')).toBeInTheDocument()
  })

  it('generates a report when the button is clicked', async () => {
    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <ReportingDashboard />
        </NotificationProvider>
      </SessionProvider>
    )

    fireEvent.click(screen.getByText('Generate Report'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/reports', expect.any(Object))
      expect(screen.getByText('Report Results')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })
  })

  it('changes chart type when select is changed', async () => {
    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <ReportingDashboard />
        </NotificationProvider>
      </SessionProvider>
    )

    fireEvent.change(screen.getByLabelText('Report Type'), { target: { value: 'shiftCoverage' } })
    fireEvent.click(screen.getByText('Generate Report'))

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  it('displays an error message when report generation fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to generate report' }),
      })
    ) as jest.Mock

    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <ReportingDashboard />
        </NotificationProvider>
      </SessionProvider>
    )

    fireEvent.click(screen.getByText('Generate Report'))

    await waitFor(() => {
      expect(screen.getByText('Failed to generate report')).toBeInTheDocument()
    })
  })
})

