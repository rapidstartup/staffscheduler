import { render, screen, fireEvent } from '@testing-library/react'
import AdvancedAnalytics from '../app/components/AdvancedAnalytics'

// Mock the Chart.js library
jest.mock('react-chartjs-2', () => ({
  Bar: () => null,
  Line: () => null,
  Pie: () => null,
}))

describe('AdvancedAnalytics', () => {
  it('renders the analytics component', () => {
    render(<AdvancedAnalytics />)
    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
  })

  it('changes chart type when select is changed', () => {
    render(<AdvancedAnalytics />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'line' } })
    expect(select).toHaveValue('line')
  })
})

