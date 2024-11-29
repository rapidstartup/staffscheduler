import { render, screen, fireEvent } from '@testing-library/react'
import AccessibilityMenu from '../app/components/AccessibilityMenu'

describe('AccessibilityMenu', () => {
  it('renders the accessibility options', () => {
    render(<AccessibilityMenu />)
    expect(screen.getByText('Accessibility Options')).toBeInTheDocument()
    expect(screen.getByLabelText('Font Size')).toBeInTheDocument()
    expect(screen.getByLabelText('High Contrast')).toBeInTheDocument()
  })

  it('changes font size when slider is moved', () => {
    render(<AccessibilityMenu />)
    const slider = screen.getByLabelText('Font Size')
    fireEvent.change(slider, { target: { value: '20' } })
    expect(slider).toHaveValue('20')
  })

  it('toggles high contrast mode', () => {
    render(<AccessibilityMenu />)
    const checkbox = screen.getByLabelText('High Contrast')
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })
})

