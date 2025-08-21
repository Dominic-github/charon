context('Genres Screen', () => {
  beforeEach(() => {
    cy.$login()
    cy.intercept('/api/genres', { fixture: 'genres.get.200.json' })
    cy.intercept('/api/genres/**', { fixture: 'genre.get.200.json' })
    cy.intercept('/api/genres/**/songs?sort=title&order=asc&page=1', { fixture: 'genre-song.get.200.json' })
  })

  it('loads the list of genres', () => {
    cy.$clickSidebarItem('Genres')

    cy.get('#genreWrapper')
      .within(() => {
        cy.findByText('Genres').should('be.visible')
        cy.get('[data-testid="genre-item"]').should('have.length', 3)
      })
  })

  it('loads the list of songs for a genre', () => {
    cy.$clickSidebarItem('Genres')

    cy.get('#genreWrapper')
      .within(() => {
        cy.findByText('Genres').should('be.visible')
        cy.get('[data-testid="genre-item"]').first().click()
      })

    cy.get('#genreScreen')
      .within(() => {
        cy.findByText('Genre:').should('be.visible')
        cy.get('[data-testid="song-item"]').should('have.length', 17)
      })
  })

  it ('plays a song from a genre', () => {
    cy.$clickSidebarItem('Genres')
    cy.$mockPlayback()

    cy.get('#genreWrapper')
      .within(() => {
        cy.findByText('Genres').should('be.visible')
        cy.get('[data-testid="genre-item"]').first().click()
      })

    cy.get('#genreScreen')
      .within(() => {
        cy.findByText('Genre:').should('be.visible')
        cy.get('[data-testid=btn-shuffle-all]').click()
      })

    cy.$assertPlaying()
  })
})
