context('YouTube', () => {
  beforeEach(() => cy.$login()
  )

  it('searches for videos when a song is played', () => {
    cy.$mockPlayback()

    cy.intercept('/api/youtube/search/song/**', {
      fixture: 'youtube-search.get.200.json',
    })

    cy.$clickSidebarItem('All Songs')
    cy.get('#allSongScreen .song-item').first().dblclick()

    cy.get('#extraTabYouTube').should('be.visible')
    cy.get('#extraTabYouTube').click()
    cy.get('#extraPanelYouTube').should('be.visible')

  })

  it('plays a video when a search result is clicked', () => {
    cy.$mockPlayback()

    cy.intercept('/api/youtube/search/song/**', {
      fixture: 'youtube-search.get.200.json',
    })

    cy.$clickSidebarItem('All Songs')
    cy.get('#allSongScreen .song-item').first().dblclick()

    cy.get('#extraTabYouTube').should('be.visible')
    cy.get('#extraTabYouTube').click()
    cy.get('#extraPanelYouTube').should('be.visible')
    cy.get('#extraPanelYouTube').within(() => {
      cy.get('[data-testid=youtube-video]').first().should('be.visible').click()
    })

    cy.findByTestId('youtube').should('be.visible')
  })
})
