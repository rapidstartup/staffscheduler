describe('Dashboard', () => {
  beforeEach(() => {
    // Log in before each test
    cy.visit('/login')
    cy.get('input[name="email"]').type('user@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
  })

  it('should display the dashboard components', () => {
    cy.get('h1').contains('Dashboard').should('be.visible')
    cy.contains('Upcoming Shifts').should('be.visible')
    cy.contains('Total Hours This Week').should('be.visible')
    cy.contains('Pending Leave Requests').should('be.visible')
  })

  it('should navigate to different sections', () => {
    cy.contains('Calendar').click()
    cy.url().should('include', '/calendar')

    cy.contains('Time Tracking').click()
    cy.url().should('include', '/time-tracking')

    cy.contains('Leave Management').click()
    cy.url().should('include', '/leave-management')
  })
})

