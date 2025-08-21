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
    cy.get('[type=password]').type('Supersecret1.')
    cy.get('[type=submit]').click({ force: true })
    cy.findByTestId('login-form').should('be.visible').and('have.class', 'error')
  })

  it('fails to log in with password not in correct format', () => {
    cy.visit('/')
    cy.get('[type=email]').type('admin@charon.test')
    cy.get('[type=password]').type('123456')
    cy.get('[type=submit]').click({ force: true })
    cy.findByTestId('login-form').should('be.visible').and('have.class', 'error')
  })

  it('fails to log in with blank email', () => {
    cy.visit('/')
    cy.get('[type=password]').type('Supersecret4.')
    cy.get('[type=submit]').click({ force: true })

    cy.get('[type=email]').then(($input) => {
      const el = $input[0] as HTMLInputElement
      const message = el.validationMessage
      expect(message).to.eq('Please fill out this field.')
    })
  })

  it('fails to log in with blank password', () => {
    cy.visit('/')
    cy.get('[type=email]').type('admin@charon.test')
    cy.get('[type=submit]').click({ force: true })
    cy.get('[type=password]').then(($input) => {
      const el = $input[0] as HTMLInputElement
      const message = el.validationMessage
      expect(message).to.eq('Please fill out this field.')
    })
  })
  it('fails to log in with invalid email', () => {
    cy.visit('/')
    cy.get('[type=email]').type('admin@@charon.test')
    cy.get('[type=password]').type('Supersecret4.')
    cy.get('[type=submit]').click({ force: true })
    cy.get('[type=email]').then(($input) => {
      const el = $input[0] as HTMLInputElement
      const message = el.validationMessage
      expect(message).to.eq('A part following \'@\' should not contain the symbol \'@\'.')
    })
  })
})
