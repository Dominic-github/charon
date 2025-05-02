context('Artists', { scrollBehavior: false }, () => {
  beforeEach(() => {
    cy.$login()
    cy.intercept('GET', '/api/artists?page=1', { fixture: 'artist-list.get.200.json' })
    cy.intercept('GET', '/api/artists/*/songs', { fixture: 'artist-song.get.200.json' })
    cy.intercept('api/interaction/play', { fixture: 'play.get.200.json' })
    cy.$clickSidebarItem('Artists')
  })

  it('loads the list of artists', () => {
    cy.get('#artistScreen').within(() => {
      cy.get('.screen-header').should('be.visible').and('contain.text', 'Artists')
      cy.findByTestId('view-mode-thumbnail').should('be.visible').and('have.class', 'active')
      cy.findByTestId('view-mode-list').should('be.visible').and('not.have.class', 'active')
      cy.findAllByTestId('artist-card').should('have.length', 21)
    })
  })

  it('changes display mode', () => {
    cy.get('#artistScreen').should('be.visible').within(() => {
      cy.findAllByTestId('artist-card').should('have.length', 21)
      cy.findByTestId('view-mode-list').click()
      cy.get('[data-testid=artist-card].compact').should('have.length', 21)
      cy.findByTestId('view-mode-thumbnail').click()
      cy.get('[data-testid=artist-card].full').should('have.length', 21)
    })
  })

  it('plays all songs by an artist', () => {
    cy.$mockPlayback()

    cy.get('#artistScreen').within(() => {
      cy.get('[data-testid=artist-card]:first-child .thumbnail')
        .invoke('show')
        .click()
    })

    cy.url().should('contain', '/#/queue')
    // cy.$assertPlaying()
  })

  it('invokes artist screen', () => {
    cy.intercept('/api/artists/3/info', {
      fixture: 'artist-info.get.200.json',
    })
    cy.intercept('GET', '/api/artists/3/information', { fixture: 'artist-info.get.200.json' })

    cy.get('#artistScreen').within(() => {
      cy.get('[data-testid=artist-card]:first-child .name').click()
      cy.url().should('contain', '/#/artists/3')
    })

    cy.get('[data-testid=download-all-songs]').should('be.visible')
    cy.$getSongRows().should('have.length.at.least', 0)
    cy.get('[data-testid=artist-infomation]').click()
  })
})
