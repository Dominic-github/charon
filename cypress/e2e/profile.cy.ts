context('Profiles & Preferences', () => {
  it('shows the current user\'s profile', () => {
    cy.$login()
    cy.findByTestId('view-profile-link').click()
    cy.url().should('contain', '/#/profile')

    cy.get('#profileScreen').within(() => {
      cy.get('.screen-header').should('contain.text', 'Profile & Preferences')

        ;[
        'profile-tab',
        'preferences-tab',
        'themes-tab',
        'integrations-tab',
      ].forEach(inputName => cy.get(`[data-testid=${inputName}]`).should('exist'))

      cy.findByTestId('update-profile-form').should('be.visible')

      ;[
        'currentPassword',
        'name',
        'email',
        'newPassword',
      ].forEach(inputName => cy.get(`[data-testid=${inputName}]`).should('exist'))

    })
  })

  it('shows instruction for Last.fm not integrated', () => {
    cy.$login({ uses_last_fm: false })
    cy.findByTestId('view-profile-link').click()
    cy.url().should('contain', '/#/profile')
    cy.get('#profileScreen').within(() => {
      cy.get('.screen-header').should('contain.text', 'Profile & Preferences')

        ;[
        'profile-tab',
        'preferences-tab',
        'themes-tab',
        'integrations-tab',
      ].forEach(inputName => cy.get(`[data-testid=${inputName}]`).should('exist'))
    })
    cy.findByTestId('integrations-tab').click()
    cy.findByTestId('lastfm-not-integrated').should('be.visible')

  })

  it('shows instruction for Last.fm integrated', () => {
    cy.$login({ uses_last_fm: true })
    cy.findByTestId('view-profile-link').click()
    cy.url().should('contain', '/#/profile')
    cy.get('#profileScreen').within(() => {
      cy.get('.screen-header').should('contain.text', 'Profile & Preferences')

        ;[
        'profile-tab',
        'preferences-tab',
        'themes-tab',
        'integrations-tab',
      ].forEach(inputName => cy.get(`[data-testid=${inputName}]`).should('exist'))
    })
    cy.findByTestId('integrations-tab').click()
    cy.findByTestId('lastfm-integrated').should('be.visible')
  })

  it('updates the user profile', () => {
    cy.intercept('PUT', '/api/me', {})
    cy.$login()
    cy.findByTestId('view-profile-link').click()

    cy.get('#profileScreen').within(() => {
      cy.get('[data-testid=currentPassword]').clear().type('current-secret')
      cy.get('[data-testid=name]').clear().type('Admin No. 2')
      cy.get('[data-testid=email]').clear().type('admin.2@charon.test')
      cy.get('[type=submit]').click()
    })

    cy.findByText('Profile updated.').should('be.visible')
    cy.findByTestId('view-profile-link').get('[title="Admin No. 2"]').should('exist')
  })

  it('updates the user profile along with password', () => {
    cy.intercept('PUT', '/api/me', {})
    cy.$login()
    cy.findByTestId('view-profile-link').click()

    cy.get('#profileScreen').within(() => {
      cy.get('[data-testid=currentPassword]').clear().type('current-secrEt')
      cy.get('[name=name]').clear().type('Admin No. 2')
      cy.get('[name=email]').clear().type('admin.2@charon.test')
      cy.get('[data-testid=newPassword]').type('new-password')
      cy.get('[type=submit]').click()
    })

    cy.findByText('Profile updated.').should('be.visible')
    cy.findByTestId('view-profile-link').get('[title="Admin No. 2"]').should('exist')
  })

  it('has an option to show/hide album art overlay', () => {
    cy.$login()
    cy.intercept('/api/me/preferences', {})
    cy.$mockPlayback()
    cy.$login({ uses_last_fm: true })
    cy.findByTestId('view-profile-link').click()
    cy.url().should('contain', '/#/profile')
    cy.get('#profileScreen').within(() => {
      cy.get('.screen-header').should('contain.text', 'Profile & Preferences')

        ;[
        'profile-tab',
        'preferences-tab',
        'themes-tab',
        'integrations-tab',
      ].forEach(inputName => cy.get(`[data-testid=${inputName}]`).should('exist'))
    })
    cy.findByTestId('preferences-tab').click()
    cy.get('[name=show_album_art_overlay]').should('exist')

    cy.get('[name=show_album_art_overlay]').should('be.checked')
    cy.get('[name=show_album_art_overlay]').uncheck()
    cy.get('[name=show_album_art_overlay]').should('not.be.checked')
    cy.get('[name=show_album_art_overlay]').check()
    cy.get('[name=show_album_art_overlay]').should('be.checked')
  })
  
  it('sets a theme', () => {
    cy.$login()

    cy.intercept('PATCH', '/api/me/preferences', {
      statusCode: 200
    })
    cy.findByTestId('view-profile-link').click()
    cy.url().should('contain', '/#/profile')
    cy.get('#profileScreen').within(() => {
      cy.get('.screen-header').should('contain.text', 'Profile & Preferences')

        ;[
        'profile-tab',
        'preferences-tab',
        'themes-tab',
        'integrations-tab',
      ].forEach(inputName => cy.get(`[data-testid=${inputName}]`).should('exist'))
    })
    cy.findByTestId('themes-tab').click()

    cy.get('.theme').eq(1).click()
    cy.get('html').should('have.attr', 'data-theme', 'violet')
  })
})
