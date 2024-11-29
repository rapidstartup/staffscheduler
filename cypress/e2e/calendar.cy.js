describe('Calendar', () => {
  beforeEach(() => {
    cy.visit('/dashboard')
    // Assuming you have a login function
    cy.login('testuser@example.com', 'password123')
  })

  it('displays the calendar', () => {
    cy.contains('Calendar').should('be.visible')
  })

  it('allows navigation between months', () => {
    const currentMonth = cy.contains(/January|February|March|April|May|June|July|August|September|October|November|December/)
    cy.get('button').contains('>').click()
    cy.contains(/January|February|March|April|May|June|July|August|September|October|November|December/)
      .should('not.have.text', currentMonth)
  })

  it('opens shift modal when clicking on a day', () => {
    cy.get('[role="button"][aria-label^=""]').first().click()
    cy.contains('Create New Shift').should('be.visible')
  })

  it('creates a new shift', () => {
    cy.get('[role="button"][aria-label^=""]').first().click()
    cy.contains('Create New Shift').should('be.visible')
    cy.get('#startTime').type('09:00')
    cy.get('#endTime').type('17:00')
    cy.get('button').contains('Save').click()
    cy.contains('Shift saved successfully').should('be.visible')
  })
})

