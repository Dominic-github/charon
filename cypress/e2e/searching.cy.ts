context('Searching', () => {
  beforeEach(() => {
    cy.$login()
    cy.get('#searchForm [name=q]').as('searchInput')
  })

  it('shows the search screen when search box receives focus', () => {
    cy.get('@searchInput').focus()
    cy.get('#searchScreen').within(() => cy.findByTestId('screen-empty-state').should('be.visible'))
  })

  it('performs an excerpt search', () => {
    cy.intercept('/api/search?q=mck', {
      fixture: 'search-excerpts.get.200.json',
    })

    cy.get('@searchInput').type('mck')

    cy.get('#searchScreen').within(() => {
      cy.$findInTestId('song-excerpts [data-testid=song-card]').should('have.length', 6)
      cy.$findInTestId('artist-excerpts [data-testid=artist-album-card]').should('have.length', 1)
      cy.$findInTestId('album-excerpts [data-testid=artist-album-card]').should('have.length', 1)
    })
  })

  it('has a button to view all matching songs', () => {
    cy.intercept('/api/search?q=mck', {
      fixture: 'search-excerpts.get.200.json',
    })

    cy.intercept('/api/search/songs?q=mck', {
      fixture: 'search-songs.get.200.json',
    })

    cy.get('@searchInput').type('mck')
    cy.get('#searchScreen [data-testid=view-all-songs-btn]').click()
    cy.url().should('contain', '/#/search/songs/?q=mck')

    cy.get('#searchSongResultsScreen').within(() => {
      cy.get('.screen-header').findByText('Results for')
      cy.get('.song-item').should('have.length', 16)
    })
  })

  it('does not have a View All button if no songs are found', () => {
    cy.intercept('/api/search?q=mck', {
      statusCode: 200,
      body: {
        songs: [],
        artists: [],
        albums: [],
        podcasts: [],
      },
    })

    cy.get('@searchInput').type('mck')
    cy.get('#searchScreen [data-testid=view-all-songs-btn]').should('not.exist')
    cy.findByTestId('song-excerpts').findByText('None found.').should('be.visible')
  })
})
