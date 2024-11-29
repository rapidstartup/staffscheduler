describe('Login Flow', () => {
  it('should successfully log in with valid credentials', () => {
    cy.visit('/login')
    cy.get('input[name="email"]').type('testuser@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // Assert that we've redirected to the dashboard after successful login
    cy.url().should('include', '/dashboard')
    cy.contains('Welcome, Test User').should('be.visible')
  })

  it('should show an error message with invalid credentials', () => {
    cy.visit('/login')
    cy.get('input[name="email"]').type('invalid@example.com')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()

    cy.contains('Invalid email or password').should('be.visible')
  })
})

