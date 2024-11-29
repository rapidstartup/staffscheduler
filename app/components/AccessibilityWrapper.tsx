import React from 'react'
import ReactDOM from 'react-dom'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

export const AccessibilityWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>
}

export const runAccessibilityTests = async (jsx: JSX.Element) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  ReactDOM.render(jsx, container)

  const results = await axe(container)
  expect(results).toHaveNoViolations()

  ReactDOM.unmountComponentAtNode(container)
  container.remove()
}

