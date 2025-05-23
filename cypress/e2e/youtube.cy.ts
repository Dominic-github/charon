context('YouTube', () => {
  beforeEach(() => cy.$login())

  it('renders a placeholder screen', () => {
    cy.$clickSidebarItem('YouTube Video')
    cy.get('#youtubeScreen').within(() => {
      cy.get('.screen-header').should('contain.text', 'YouTube Video')
      cy.findByTestId('youtube-placeholder').should('be.visible')
    })
  })

  it('searches for videos when a song is played', () => {
    cy.$mockPlayback()

    cy.intercept('/api/youtube/search/song/**', {
      fixture: 'youtube-search.get.200.json',
    })

    cy.$clickSidebarItem('All Songs')
    cy.get('#allSongsScreen .song-item:first-child').dblclick()

    cy.get('#extra').within(() => {
      cy.get('#extraTabYouTube').click()
      cy.findAllByTestId('youtube-search-result').should('have.length', 2)
      cy.findByTestId('youtube-search-more-btn').click()
      cy.findAllByTestId('youtube-search-result').should('have.length', 4)
    })
  })

  it('plays a video when a search result is clicked', () => {
    cy.$mockPlayback()

    cy.$clickSidebarItem('All Songs')
    cy.get('#allSongScreen .song-item:first-child').dblclick()

    cy.get('#extra').within(() => {
      cy.get('#extraTabYouTube').click()
      cy.get('[data-testid=youtube-search-result]:nth-child(2)').click()
    })

    cy.url().should('contain', '/#/youtube')
    cy.$assertSidebarItemActive('YouTube Video')
    cy.get('#youtubeScreen .screen-header').should('contain', 'YouTube Video #2')
  })
})
