import React from 'react'
import { render } from '@testing-library/react'
import Calendar from '../../app/components/Calendar'
import { runAccessibilityTest } from '../../app/utils/accessibilityTest'

describe('Calendar', () => {
  it('renders without crashing', () => {
    render(<Calendar />)
  })

  it('passes accessibility tests', async () => {
    const { container } = render(<Calendar />)
    await runAccessibilityTest(container.innerHTML)
  })

  // ... other tests
})

