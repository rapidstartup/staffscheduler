import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

export async function runAccessibilityTest(html: string) {
  const results = await axe(html)
  expect(results).toHaveNoViolations()
}

