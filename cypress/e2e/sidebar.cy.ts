context('Sidebar Functionalities', () => {
  const commonMenuItems = [
    ['All Songs', '/#/songs'],
    ['Albums', '/#/albums'],
    ['Artists', '/#/artists'],
    ['Genres', '/#/genres'],
    ['Podcasts', '/#/podcasts'],

    ['Favorites', '/#/favorites'],
    ['Recently Played', '/#/recently-played'],
    ['Simple Playlist', '/#/playlist/**'],
  ]

  const managementAdminMenuItems = [
    ['Settings', '/#/settings'],
    ['Upload', '/#/upload'],
    ['Users', '/#/users'],
  ]

  const managementUserMenuItems = [
    ['Upload', '/#/upload'],
  ]

  function assertMenuItem(text: string, url: string) {
    cy.intercept('/api/albums?**', { fixture: 'album-list.get.200.json' })
    cy.intercept('GET', '/api/artists?**', { fixture: 'artist-list.get.200.json' })
    cy.intercept('GET', '/api/songs/favorite', {
      fixture: 'favorites.get.200.json',
    })
    cy.intercept('/api/podcasts', { fixture: 'podcasts.get.200.json' })
    cy.intercept('/api/genres', { fixture: 'genres.get.200.json' })
    cy.intercept('/api/playlists/**/songs', {
      fixture: 'playlist-songs.get.200.json',
    })
    cy.intercept('/api/playlists/**/collaborators', {
      fixture: 'collaborators.get.200.json',
    })
    cy.intercept('GET', '/api/songs/recently-played', { statusCode: 200, fixture: 'recently-played.get.200.json' })

    cy.$clickSidebarItem(text)
    if (url === '/#/playlist/**') {
      cy.url().should('match', /\/#\/playlists\/[a-f0-9-]+$/)
    } else {
      cy.url().should('include', url)
    }
  }

  it('contains menu items', () => {
    cy.$login()
    cy.get('#sidebar').should('exist')
    cy.get('#sidebar .home-btn').should('exist').click()
    cy.url().should('contain', '/#/home')

    cy.$each(commonMenuItems, assertMenuItem)
    cy.$each(managementAdminMenuItems, assertMenuItem)
  })

  it('does not contain management items for non-admins', () => {
    cy.$loginAsNonAdmin()
    cy.get('#sidebar').should('exist')
    cy.get('#sidebar .home-btn').should('exist').click()
    cy.url().should('contain', '/#/home')

    cy.$each(commonMenuItems, assertMenuItem)
    cy.$each(managementUserMenuItems, assertMenuItem)
  })

  it('does not have a YouTube item if YouTube is not used', () => {
    cy.$login({ uses_you_tube: false })
    cy.get('#sidebar').findByTestId('youtube').should('not.exist')
  })
})
