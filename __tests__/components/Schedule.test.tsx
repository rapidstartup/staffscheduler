import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import Schedule from '../../app/components/Schedule'

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

describe('Schedule', () => {
  it('renders the schedule component', () => {
    render(
      <SessionProvider session={{ user: { role: 'staff' } }}>
        <Schedule />
      </SessionProvider>
    )

    expect(screen.getByText('Weekly Schedule')).toBeInTheDocument()
    expect(screen.getByText('Previous Week')).toBeInTheDocument()
    expect(screen.getByText('Next Week')).toBeInTheDocument()
  })

  it('allows navigation between weeks', () => {
    render(
      <SessionProvider session={{ user: { role: 'staff' } }}>
        <Schedule />
      </SessionProvider>
    )

    const prevWeekButton = screen.getByText('Previous Week')
    const nextWeekButton = screen.getByText('Next Week')
    const currentWeekDisplay = screen.getByTestId('current-week')

    const initialWeek = currentWeekDisplay.textContent

    fireEvent.click(nextWeekButton)
    expect(currentWeekDisplay.textContent).not.toBe(initialWeek)

    fireEvent.click(prevWeekButton)
    expect(currentWeekDisplay.textContent).toBe(initialWeek)
  })

  it('shows generate suggestions button for managers', () => {
    render(
      <SessionProvider session={{ user: { role: 'manager' } }}>
        <Schedule />
      </SessionProvider>
    )

    expect(screen.getByText('Generate Suggestions')).toBeInTheDocument()
  })

  it('does not show generate suggestions button for staff', () => {
    render(
      <SessionProvider session={{ user: { role: 'staff' } }}>
        <Schedule />
      </SessionProvider>
    )

    expect(screen.queryByText('Generate Suggestions')).not.toBeInTheDocument()
  })
})

