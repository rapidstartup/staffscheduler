import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import CloneWeeklySchedule from '../app/components/CloneWeeklySchedule'

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock

describe('CloneWeeklySchedule', () => {
  it('renders the clone schedule component for managers', () => {
    render(
      <SessionProvider session={{ user: { role: 'manager' } }}>
        <CloneWeeklySchedule />
      </SessionProvider>
    )

    expect(screen.getByText('Clone Weekly Schedule')).toBeInTheDocument()
    expect(screen.getByLabelText('Select Week to Clone')).toBeInTheDocument()
    expect(screen.getByText('Clone Schedule')).toBeInTheDocument()
  })

  it('does not render for non-manager users', () => {
    render(
      <SessionProvider session={{ user: { role: 'staff' } }}>
        <CloneWeeklySchedule />
      </SessionProvider>
    )

    expect(screen.queryByText('Clone Weekly Schedule')).not.toBeInTheDocument()
  })

  it('clones the schedule when the button is clicked', async () => {
    render(
      <SessionProvider session={{ user: { role: 'manager' } }}>
        <CloneWeeklySchedule />
      </SessionProvider>
    )

    fireEvent.click(screen.getByText('Clone Schedule'))

    await waitFor(() => {
      expect(screen.getByText('Schedule cloned successfully for the following week!')).toBeInTheDocument()
    })
  })

  it('shows an error message when cloning fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as jest.Mock

    render(
      <SessionProvider session={{ user: { role: 'manager' } }}>
        <CloneWeeklySchedule />
      </SessionProvider>
    )

    fireEvent.click(screen.getByText('Clone Schedule'))

    await waitFor(() => {
      expect(screen.getByText('An error occurred while cloning the schedule. Please try again.')).toBeInTheDocument()
    })
  })
})

