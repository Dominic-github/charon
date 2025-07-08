context('Favorites', { scrollBehavior: false }, () => {
  beforeEach(() => {
    cy.$login()
    cy.intercept('GET', '/api/songs/favorite', {
      fixture: 'favorites.get.200.json',
    })
  })

  it('loads the list of favorites', () => {
    cy.$clickSidebarItem('Favorites')

    cy.get('#favoriteScreen')
      .within(() => {
        cy.findByText('Your Favorites').should('be.visible')
        cy.findByText('Download All').should('be.visible')

        cy.$getSongRows().should('have.length', 3).each(row => cy.wrap(row).get('[data-title="Unlike"]').should('be.visible'))
      })
  })

  it('adds a favorite song from Like button', () => {
    cy.intercept('POST', '/api/interaction/like', {
      fixture: 'like.post.201.json',
    })

    cy.$clickSidebarItem('Favorites')

    cy.$clickSidebarItem('All Songs')

    cy.get('#allSongScreen')
      .within(() => {
        cy.$getSongRowAt(3).within(() => {
          cy.findByTestId('like-btn')
            .click()
        })
      })

    cy.$assertFavoriteSongCount(4)
  })

  it('adds a favorite song from Add To dropdown', () => {
    cy.intercept('POST', '/api/interaction/batch/like', {
      fixture: 'batch-like.post.200.json',
    })

    cy.$clickSidebarItem('Favorites')

    cy.$clickSidebarItem('All Songs')

    cy.get('#allSongScreen')
      .within(() => {
        cy.$getSongRowAt(3).click()
        cy.findByTestId('add-to-btn').click()
        cy.findByTestId('add-to-menu').should('be.visible').within(() => cy.findByText('Favorites').click()).should('not.be.visible')
      })

    cy.$assertFavoriteSongCount(4)
  })

  it('deletes a favorite with Unlike button', () => {
    cy.intercept('POST', '/api/interaction/like', {})
    cy.$clickSidebarItem('Favorites')

    cy.get('#favoriteScreen')
      .within(() => {
        cy.$getSongRows().should('have.length', 3).first().should('contain.text', '00').within(() => cy.findByTestId('like-btn').click())

        cy.$getSongRows().should('have.length', 2).first().should('not.contain.text', '00')
      })
  })

  it('deletes a favorite with Backspace key', () => {
    cy.intercept('POST', '/api/interaction/like', {})
    cy.$clickSidebarItem('Favorites')

    cy.get('#favoriteScreen')
      .within(() => {
        cy.$getSongRows().should('have.length', 3).first().should('contain.text', '00').click().type('{backspace}')

        cy.$getSongRows().should('have.length', 2).first().should('not.contain.text', '00')
      })
  })
})
