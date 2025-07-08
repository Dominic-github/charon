context('Podcast Screen', () => {
  beforeEach(() => {
    cy.$login()
    cy.intercept('/api/podcasts', { fixture: 'podcasts.get.200.json' })
    cy.intercept('/api/podcasts/**/episodes', { fixture: 'episodes.get.200.json' })
  })

   it('loads the list of podcasts', () => {
    cy.$clickSidebarItem('Podcasts')

    cy.get('#podcastListScreen')
      .within(() => {
        cy.findByText('Podcasts').should('be.visible')
        cy.get('[data-testid="podcast-item"]').should('have.length', 2)
      })
  })

  it('loads the list episodes of podcast', () => {
    cy.$clickSidebarItem('Podcasts')

    cy.get('#podcastListScreen')
      .within(() => {
        cy.findByText('Podcasts').should('be.visible')
        cy.get('[data-testid="podcast-item"]').first().click()
      })

    cy.get('#podcastScreen')
      .within(() => {
        cy.get('[data-testid="episode-item"]').should('have.length', 13)
      })
  })

    it('loads the episode screen of podcast', () => {
    cy.$clickSidebarItem('Podcasts')

    cy.get('#podcastListScreen')
      .within(() => {
        cy.findByText('Podcasts').should('be.visible')
        cy.get('[data-testid="podcast-item"]').first().click()
      })

    cy.get('#podcastScreen')
      .within(() => {
        cy.get('[data-testid="episode-item"]').first().click()
      })
    cy.get('#episodeScreen').should('be.visible')

  })

  it ('plays a podcast episode', () => {
    cy.$clickSidebarItem('Podcasts')
    cy.$mockPlayback()

    cy.get('#podcastListScreen')
      .within(() => {
        cy.findByText('Podcasts').should('be.visible')
        cy.get('[data-testid="podcast-item"]').first().click()
      })

    cy.get('#podcastScreen')
      .within(() => {
        cy.get('.playPodcastBtn').should('be.visible')
        cy.get('.playPodcastBtn').click()
      })

    cy.$assertPlaying()
  })

})