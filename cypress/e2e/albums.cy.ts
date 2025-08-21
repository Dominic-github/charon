describe('Albums', { scrollBehavior: false }, () => {
  beforeEach(() => {
    cy.$login()
    cy.intercept('/api/albums?page=1&sort=name&order=asc', { fixture: 'album-list.get.200.json' })
    cy.intercept('GET', '/api/albums/**/songs', { fixture: 'album-song.get.200.json' })
    cy.intercept('/api/interaction/play', { fixture: 'play.get.200.json' })
    cy.$clickSidebarItem('Albums')
  })

  it('loads the list of albums', () => {
    cy.get('#albumListScreen').within(() => {
      cy.get('.screen-header').should('be.visible').and('contain', 'Albums')
      cy.findByTestId('view-mode-thumbnail').should('be.visible').and('have.class', 'active')
      cy.findByTestId('view-mode-list').should('be.visible')
      cy.findAllByTestId('album-card').should('have.length', 4)
    })
  })

  it('changes display mode', () => {
    cy.get('#albumListScreen').within(() => {
      cy.findByTestId('view-mode-list').click()
      cy.get('[data-testid=album-card].compact').should('have.length', 4)
      cy.findByTestId('view-mode-thumbnail').click()
      cy.get('[data-testid=album-card].full').should('have.length', 4)
    })
  })

  it('plays album songs', () => {
    cy.$mockPlayback()
    cy.get('#albumListScreen [data-testid=album-card] .thumbnail').first().click()
    cy.url().should('contain', '/#/queue')
    cy.$assertPlaying()
  })

  it('invokes album screen', () => {
    cy.intercept('GET', '/api/albums/**/information', { fixture: 'album-info.get.200.json' })
    cy.intercept('GET', '/api/albums', { fixture: 'album-page.get.200.json' })
    cy.intercept('GET', '/api/permissions/album/**/edit', { fixture: 'permissions.album.get.200.json' })
    cy.get('#albumListScreen [data-testid=album-card] [data-testid=name]').first().click()

    cy.get('#albumScreen [data-testid=album-infomation]').click()
  })

  it('invokes artist screen', () => {
    cy.intercept('GET', '/api/artists/**/songs', { fixture: 'artist-song.get.200.json' })
    cy.intercept('GET', '/api/artists/**/information', { fixture: 'artist-info.get.200.json' })
    cy.get('#albumListScreen [data-testid=album-card] [data-testid=artist-name]').first().click()
    cy.url().should('match', /\/#\/artists\//)
  })
})
