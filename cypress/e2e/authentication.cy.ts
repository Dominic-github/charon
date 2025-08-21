describe('Authentication', () => {
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
    cy.get('[id=mainContent]', { timeout: 10000 }).should('be.visible')
  })

  it('fails to log in with invalid credentials', () => {
    cy.intercept('POST', '/api/me', {
      statusCode: 404,
    })

    cy.visit('/')
    submitLoginForm()
    cy.findByTestId('login-form').should('be.visible').and('have.class', 'error')
  })

  it('fails to log in with wrong password', () => {
    cy.intercept('POST', '/api/me', {
      statusCode: 401,
    })

    cy.visit('/')
    cy.get('[type=email]').type('admin@charon.test')
    cy.get('[type=password]').type('123456')
    cy.get('[type=submit]').click({ force: true })
    cy.findByTestId('login-form').should('be.visible').and('have.class', 'error')
  })

  it('registers a new user', () => {
    cy.intercept('POST', '/api/register', {
      statusCode: 201,
    })

    cy.intercept('/api/data', {
      fixture: 'data.get.200.json',
    })
    cy.intercept('/api/overview', {
      fixture: 'overview.data.get.200.json',
    })

    cy.visit('/')
    cy.get('[data-testid=register-btn]').click()

    cy.get('[data-testid=register-fullname]').type('Test User')
    cy.get('[data-testid=register-email]').type('test@ccharon.dev')
    cy.get('[data-testid=register-password]').type('Test123456.')
    cy.get('[data-testid=register-confirm-password]').type('Test123456.')

    cy.get('[data-testid=term-btn]').click()
    cy.get('[data-testid=register-submit').click()

    cy.contains('Account created successfully!').should('be.visible')
  })

  it('fails to register user', () => {
    cy.intercept('POST', '/api/register', {
      statusCode: 500,
    })

    cy.intercept('/api/data', {
      fixture: 'data.get.200.json',
    })
    cy.intercept('/api/overview', {
      fixture: 'overview.data.get.200.json',
    })

    cy.visit('/')
    cy.get('[data-testid=register-btn]').click()

    cy.get('[data-testid=register-fullname]').type('Test User')
    cy.get('[data-testid=register-email]').type('test@ccharon.dev')
    cy.get('[data-testid=register-password]').type('Test123456.')
    cy.get('[data-testid=register-confirm-password]').type('Test123456.')

    cy.get('[data-testid=term-btn]').click()
    cy.get('[data-testid=register-submit').click()

    cy.findByTestId('register-form').should('be.visible').and('have.class', 'error')
  })

  it('when already logged in, redirects to home', () => {
    cy.$login()
    cy.visit('/')
    cy.get('[id=mainContent]').should('be.visible')
  })

  it('logs out', () => {
    cy.intercept('DELETE', '/api/me', {})
    cy.$login()
    cy.get('[id=btn-logout]').click()
    cy.findByTestId('login-form').should('be.visible')
  })

  it('forgets password', () => {
    cy.intercept('POST', '/api/forgot-password', {
      statusCode: 204,
      payload: {
        email: 'admin@charon.test',
      },
    })

    cy.visit('/')
    cy.get('[data-testid=forgot-password-link]').click()

    cy.get('[data-testid=email-forget-input]').type('admin@charon.test')
    cy.get('[data-testid=reset-password-btn]').click()

    cy.contains('Password reset link sent. Please check your email.').should('be.visible')
  })
})
