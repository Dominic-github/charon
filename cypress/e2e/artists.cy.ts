context('Artists', { scrollBehavior: false }, () => {
  beforeEach(() => {
    cy.$login()
    cy.intercept('/api/artists/**/info', {
      fixture: 'artist-info.get.200.json',
    })
    cy.intercept('GET', '/api/artists/**/information', { fixture: 'artist-info.get.200.json' })
    cy.intercept('GET', '/api/artists?page=1', { fixture: 'artist-list.get.200.json' })
    cy.intercept('GET', '/api/artists/**/songs', { fixture: 'artist-song.get.200.json' })


    cy.$clickSidebarItem('Artists')
  })

  it('loads the list of artists', () => {
    cy.get('#artistListScreen').within(() => {
      cy.get('.screen-header').should('be.visible').and('contain.text', 'Artists')
      cy.findByTestId('view-mode-thumbnail').should('be.visible').and('have.class', 'active')
      cy.findByTestId('view-mode-list').should('be.visible').and('not.have.class', 'active')
      cy.findAllByTestId('artist-card').should('have.length', 4)
    })
  })

  it('changes display mode', () => {
    cy.get('#artistListScreen').should('be.visible').within(() => {
      cy.findAllByTestId('artist-card').should('have.length', 4)
      cy.findByTestId('view-mode-list').click()
      cy.get('[data-testid=artist-card].compact').should('have.length', 4)
      cy.findByTestId('view-mode-thumbnail').click()
      cy.get('[data-testid=artist-card].full').should('have.length', 4)
    })
  })

  it('plays all songs by an artist', () => {
    cy.$mockPlayback()
    cy.get('#artistListScreen').within(() => {
      cy.get('[data-testid=artist-card] .thumbnail')
        .eq(2)
        .invoke('show')
        .click()
    })

    cy.url().should('contain', '/#/queue')
    cy.$assertPlaying()
  })

  it('invokes artist screen', () => {

    cy.intercept('GET', '/api/artists/**/information', { fixture: 'artist-info.get.200.json' })

    cy.get('#artistListScreen').within(() => {
      cy.get('[data-testid=artist-card] .name').eq(2).click()
    })
    cy.url().should('match', /\/#\/artists\/\d+$/);
    cy.get('#artistScreen').should('be.visible')
    cy.get('[data-testid=download-all-songs]').should('be.visible')
    cy.$getSongRows().should('have.length.at.least', 0)
    cy.get('[data-testid=artist-infomation]').click()
  })
})
