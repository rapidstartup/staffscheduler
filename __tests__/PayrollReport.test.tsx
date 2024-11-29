import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import PayrollReport from '../app/components/PayrollReport'

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { userId: '1', userName: 'John Doe', totalHours: 40, totalPay: 800 },
      { userId: '2', userName: 'Jane Smith', totalHours: 35, totalPay: 700 },
    ]),
  })
) as jest.Mock

describe('PayrollReport', () => {
  it('renders the payroll report for managers', async () => {
    render(
      <SessionProvider session={{ user: { role: 'manager' } }}>
        <PayrollReport />
      </SessionProvider>
    )

    expect(screen.getByText('Payroll Report')).toBeInTheDocument()
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
    expect(screen.getByLabelText('End Date')).toBeInTheDocument()
    expect(screen.getByText('Generate Report')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Generate Report'))

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('40.00')).toBeInTheDocument()
      expect(screen.getByText('$800.00')).toBeInTheDocument()
    })
  })

  it('does not render for non-manager users', () => {
    render(
      <SessionProvider session={{ user: { role: 'staff' } }}>
        <PayrollReport />
      </SessionProvider>
    )

    expect(screen.queryByText('Payroll Report')).not.toBeInTheDocument()
  })
})

