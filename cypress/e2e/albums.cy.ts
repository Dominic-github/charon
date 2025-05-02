describe('Albums', { scrollBehavior: false }, () => {
  beforeEach(() => {
    cy.$login()
    cy.intercept('/api/albums?page=1', { fixture: 'album-list.get.200.json' })
    cy.intercept('GET', '/api/albums/*/songs', { fixture: 'album-song.get.200.json' })
    cy.intercept('api/interaction/play', { fixture: 'play.get.200.json' })
    cy.$clickSidebarItem('Albums')
  })

  it('loads the list of albums', () => {
    cy.get('#albumListScreen').within(() => {
      cy.get('.screen-header').should('be.visible').and('contain', 'Albums')
      cy.findByTestId('view-mode-thumbnail').should('be.visible').and('have.class', 'active')
      cy.findByTestId('view-mode-list').should('be.visible')
      cy.findAllByTestId('album-card').should('have.length', 21)
    })
  })

  it('changes display mode', () => {
    cy.get('#albumListScreen').within(() => {
      cy.findByTestId('view-mode-list').click()
      cy.get('[data-testid=album-card].compact').should('have.length', 21)
      cy.findByTestId('view-mode-thumbnail').click()
      cy.get('[data-testid=album-card].full').should('have.length', 21)
    })
  })

  it('plays album songs', () => {
    cy.$mockPlayback()
    cy.get('#albumListScreen [data-testid=album-card]:first-child .thumbnail').click()
    cy.url().should('contain', '/#/queue')
    // cy.$assertPlaying()
  })

  it('invokes album screen', () => {
    cy.intercept('GET', '/api/albums/3/information', { fixture: 'album-info.get.200.json' })
    cy.intercept('GET', '/api/albums?page=2', { fixture: 'album-page.get.200.json' })
    cy.get('#albumListScreen [data-testid=album-card]:first-child [data-testid=name]').click()

    cy.get('#albumScreen [data-testid=album-infomation]').click()
  })

  it('invokes artist screen', () => {
    cy.intercept('GET', '/api/artists/3', { fixture: 'artist.get.200.json' })
    cy.intercept('GET', '/api/artists/3/songs', { fixture: 'artist-song.get.200.json' })
    cy.intercept('GET', '/api/artists/3/information', { fixture: 'artist-info.get.200.json' })
    cy.get('#albumListScreen [data-testid=album-card]:first-child [data-testid=artist-name]').click()
    cy.url().should('contain', '/#/artists/3')
  })
})
