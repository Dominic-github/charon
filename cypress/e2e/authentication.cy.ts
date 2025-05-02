context('Authentication', () => {
  function submitLoginForm() {
    cy.get('[type=email]').type('admin@charon.test')
    cy.get('[type=password]').type('Supersecret4.')
    cy.get('[type=submit]').click({ force: true })
  }

  it('logs in with valid credentials', () => {
    cy.intercept('POST', '/api/me', {
      'token': 'mock-token',
      'audio-token': 'mock-audio',
    })

    cy.intercept('/api/data', {
      fixture: 'data.get.200.json',
    })
    cy.intercept('/api/overview', {
      fixture: 'overview.data.get.200.json',
    })

    cy.visit('/')
    submitLoginForm()
    cy.get('[id=mainContent]').should('be.visible')
  })

  it('fails to log in with invalid credentials', () => {
    cy.intercept('POST', '/api/me', {
      statusCode: 404,
    })

    cy.visit('/')
    submitLoginForm()
    cy.findByTestId('login-form').should('be.visible').and('have.class', 'error')
  })

  it('logs out', () => {
    cy.intercept('DELETE', '/api/me', {})
    cy.$login()
    cy.get('[id=btn-logout]').click()
    cy.findByTestId('login-form').should('be.visible')
  })
})
