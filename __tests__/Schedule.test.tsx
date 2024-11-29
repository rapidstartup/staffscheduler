import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import Schedule from '../app/components/Schedule'

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock

jest.mock('../app/utils/schedulingAlgorithm', () => ({
  generateSchedule: jest.fn(() => ({})),
}))

describe('Schedule', () => {
  it('renders the schedule component', async () => {
    render(
      <SessionProvider session={null}>
        <Schedule />
      </SessionProvider>
    )

    expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    expect(screen.getByText('Previous Week')).toBeInTheDocument()
    expect(screen.getByText('Next Week')).toBeInTheDocument()
    expect(screen.getByText('Clone This Week\'s Schedule')).toBeInTheDocument()

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2) // Once for staff, once for shifts
    })
  })

  it('allows navigation between weeks', () => {
    render(
      <SessionProvider session={null}>
        <Schedule />
      </SessionProvider>
    )

    const currentWeek = screen.getByText(/\w+ \d{1,2}, \d{4} - \w+ \d{1,2}, \d{4}/)
    const initialWeek = currentWeek.textContent

    fireEvent.click(screen.getByText('Next Week'))
    expect(currentWeek.textContent).not.toBe(initialWeek)

    fireEvent.click(screen.getByText('Previous Week'))
    expect(currentWeek.textContent).toBe(initialWeek)
  })

  it('attempts to clone the schedule when button is clicked', async () => {
    render(
      <SessionProvider session={null}>
        <Schedule />
      </SessionProvider>
    )

    fireEvent.click(screen.getByText('Clone This Week\'s Schedule'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/clone-schedule', expect.any(Object))
    })
  })
})

