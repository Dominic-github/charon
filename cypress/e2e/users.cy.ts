context('User Management', () => {
  beforeEach(() => {
    cy.$login()
    cy.intercept('GET', '/api/users', {
      fixture: 'users.get.200.json',
    })
    cy.$clickSidebarItem('Users')
  })

  it('shows the list of users', () => {
    cy.get('#userListScreen').within(() => {
      cy.findAllByTestId('user-card').should('have.length', 4).and('be.visible')
    })
  })

  it('adds a user', () => {
    cy.intercept('POST', '/api/users', {
      fixture: 'user.post.200.json',
    })

    cy.findByTestId('add-user-btn').click()
    cy.findByTestId('add-user-form').within(() => {
      cy.get('[name=name]').should('be.focused').type('Charles')
      cy.get('[name=email]').type('charles@charon.test')
      cy.get('[name=password]').type('Test123456789.')
      cy.get('[name=is_admin]').check()
      cy.get('[type=submit]').click()
    })

    cy.findByText('New user "Charles" created.').should('be.visible')
    cy.findAllByTestId('user-card').should('have.length', 5)

    cy.get('#userListScreen').within(() => {
      cy.findByText('Charles').should('be.visible')
      cy.findByText('charles@charon.test').should('be.visible')
    })
  })

  it('invite user by email', () => {
    cy.intercept('POST', '/api/invitations', {
      statusCode: 200,
      fixture: 'invitation.post.200.json',

    })

    cy.get('#userListScreen').findByTestId('invite-user-btn').click()
    cy.findByTestId('invite-user-form').within(() => {
      cy.get('[name=emails]').click().should('be.focused').type('user-invite@charon.test')
      cy.get('[type=submit]').click()
    })
    cy.findByText('Invitation sent.').should('be.visible')

    cy.get('[data-testid=user-card]').each(() => {
      cy.findByText('user-invite@charon.test').should('be.visible')
    })
  })

  it('invite multi user by email', () => {
    cy.intercept('POST', '/api/invitations', {
      statusCode: 200,
      fixture: 'invitations.post.200.json',

    })
    cy.get('#userListScreen').findByTestId('invite-user-btn').click()
    cy.findByTestId('invite-user-form').within(() => {
      cy.get('[name=emails]').click().should('be.focused').type('user-invite-1@charon.test{enter}user-invite-2@charon.test')
      cy.get('[type=submit]').click()
    })

    cy.get('[data-testid=user-card]').each(() => {
      cy.findByText('user-invite-1@charon.test').should('be.visible')
      cy.findByText('user-invite-2@charon.test').should('be.visible')
    })
  })

  it('revoke user by email', () => {
    cy.intercept('DELETE', '/api/invitations', {
      statusCode: 204,

    })

    cy.intercept('POST', '/api/invitations', {
      statusCode: 200,
      fixture: 'invitation.post.200.json',

    })

    cy.get('#userListScreen').findByTestId('invite-user-btn').click()
    cy.findByTestId('invite-user-form').within(() => {
      cy.get('[name=emails]').click().should('be.focused').type('user-invite@charon.test')
      cy.get('[type=submit]').click()
    })
    cy.findByText('Invitation sent.').should('be.visible')

    cy.get('[data-testid=user-card]').each(() => {
      cy.findByText('user-invite@charon.test').should('be.visible')
    })

    cy.get('[data-testid=user-card]').each(() => {
      if (cy.findByText('user-invite@charon.test')) {
        cy.get('.revoke-user-btn').should('be.visible').click({ force: true })
        cy.$confirm()
        return false
      }
    })

    cy.get('[data-testid=user-card]').each(() => {
      cy.findByText('user-invite@charon.test').should('not.exist')
    })
  })

  it('redirects to profile for current user', () => {
    cy.get('#userListScreen [data-testid=user-card]').findByText('Your Profile').click({ force: true })
    cy.url().should('contain', '/#/profile')
  })

  it('edits a user', () => {
    cy.intercept('PUT', '/api/users/**', {
      fixture: 'user.put.200.json',
    })

    cy.get('#userListScreen [data-testid=user-card] .edit-user-btn').eq(2).click({ force: true })

    cy.findByTestId('edit-user-form').within(() => {
      cy.get('[name=name]').should('be.focused').and('have.value', 'Test').clear().type('Adriana')

      cy.get('[name=email]').should('have.value', 'test@charon.dev').clear().type('adriana@charon.test')

      cy.get('[name=password]').should('have.value', '')
      cy.get('[type=submit]').click()
    })

    cy.findByText('User profile updated.').should('be.visible')

    cy.get('#userListScreen').within(() => {
      cy.findByText('Adriana').should('be.visible')
      cy.findByText('adriana@charon.test').should('be.visible')
    })
  })

  it('deletes a user', () => {
    cy.intercept('DELETE', '/api/users/**', {
      statusCode: 204,
    })

    cy.get('#userListScreen [data-testid=user-card] .delete-user-btn').eq(1).click()
    cy.$confirm()
    cy.findByText('User "Test" deleted.').should('be.visible')
    cy.get('#userListScreen [data-testid=user-card]').should('have.length', 3)
  })
})
