context('Playlists', () => {
  beforeEach(() => {
    cy.$login()

    cy.intercept('/api/playlists/**/songs', {
      fixture: 'playlist-songs.get.200.json',
    })
    cy.intercept('/api/playlists/**/collaborators', {
      fixture: 'collaborators.get.200.json',
    })

    cy.intercept('POST', '/api/playlists/**/invite', {
      fixture: 'invite-collaborator.post.200.json',
    })

    cy.intercept('PUT', '/api/playlists/**', {})
    cy.intercept('DELETE', '/api/playlists/**', { statusCode: 204 })
    cy.intercept('POST', '/api/playlists', {
      fixture: 'playlist.post.200.json',
    })
  })

  it('displays a playlist when sidebar menu item is clicked', () => {
    cy.$clickSidebarItem('Simple Playlist')

    cy.get('#playlistScreen').within(() => {
      cy.get('.screen-header').should('be.visible').and('contain', 'Simple Playlist')
      cy.$getSongRows().should('have.length', 2)
      cy.findByText('Download All').should('be.visible')
      ;['.btn-shuffle-all', '.btn-delete-playlist'].forEach(selector => cy.get(selector).should('be.visible'))
    })
  })

  it('deletes a playlist', () => {
    cy.$clickSidebarItem('Simple Playlist').as('menuItem')
    cy.get('#playlistScreen .btn-delete-playlist').click().$confirm()
    cy.url().should('contain', '/#/home')
    cy.get('@menuItem').should('not.exist')
  })

  it('deletes a playlist from the sidebar', () => {
    cy.get('#sidebar').findByText('Simple Playlist').as('menuItem').rightclick()
    cy.get('#playlist-context-menu').findByText('Delete').click()
    cy.$confirm()

    cy.url().should('contain', '/#/home')
    cy.get('@menuItem').should('not.exist')
  })

  it('creates a simple playlist from the sidebar', () => {
    cy.intercept('/api/playlists/**/songs', {
      fixture: 'empty-playlist.get.200.json',
    })

    cy.findByTestId('create-playlist-context-menu-button').click()
    cy.findByTestId('playlist-context-menu-create-simple').click()

    cy.get('#create-playlist-form [name=name]').as('nameInput').should('be.visible')
    cy.get('@nameInput').clear().type('charon{enter}')

    cy.get('#sidebar .current').findByText('charon')

    cy.findByText('Playlist "charon" created.').should('be.visible')
    cy.get('#playlistScreen .screen-header').should('be.visible').and('contain', 'charon')

    cy.get('#playlistScreen [data-testid=screen-empty-state]')
      .should('be.visible')
      .and('contain', 'The playlist is currently empty.')
  })

  it('adds songs into an existing playlist', () => {
    cy.intercept('PUT', '/api/playlists/**/sync', {})

    cy.$assertPlaylistSongCount('Simple Playlist', 2)

    cy.$clickSidebarItem('All Songs')

    cy.get('#allSongScreen').within(() => {
      cy.$selectSongRange(0, 1)
      cy.findByTestId('add-to-btn').click()

      // Intercept the request to add songs to the playlist
      cy.intercept('/api/playlists/**/songs', {
        fixture: 'playlist-update-songs.get.200.json',
      })

      cy.findByTestId('add-to-menu')
        .should('be.visible')
        .within(() => cy.findByText('Simple Playlist').click())
        .should('not.be.visible')
    })

    cy.findByText('Songs added into "Simple Playlist."').should('be.visible')
    cy.$assertPlaylistSongCount('Simple Playlist', 4)
  })

  it('creates a playlist directly from songs', () => {
    cy.$clickSidebarItem('All Songs')

    cy.get('#allSongScreen').within(() => {
      cy.$selectSongRange(3, 4)
      cy.findByTestId('add-to-btn').click()

      cy.findByTestId('add-to-new-playlist').click()
    })

    cy.get('#create-playlist-form').should('be.visible').within(() => {
      cy.get('[name=name]').as('nameInput').click().should('be.focused')
      cy.get('@nameInput').clear().type('charon{enter}')
    })

    cy.get('#sidebar .current').findByText('charon')

    cy.findByText('Playlist "charon" created.').should('be.visible')
    cy.$assertPlaylistSongCount('charon', 2)
  })

  it('updates a simple playlist from the sidebar', () => {
    cy.get('#sidebar').findByText('Simple Playlist').as('menuItem').rightclick()
    cy.get('#playlist-context-menu').findByText('Edit…').click()

    cy.get('#edit-playlist-form').findByText('Edit Playlist').should('be.visible')
    cy.get('[name=name]').as('nameInput').click().should('be.focused')
    cy.get('@nameInput').clear().type('Simple Playlist Updated{enter}')
    cy.findByText('Playlist updated.').should('be.visible')
    cy.get('#sidebar').findByText('Simple Playlist Updated').should('be.visible')
  })

  it('creates a smart playlist', () => {
    cy.intercept('/api/playlists/**/songs', {
      fixture: 'smartplaylist.get.200.json',
    })
    cy.intercept('POST', '/api/playlists', {
      fixture: 'smartplaylist.post.200.json',
    })
    cy.findByTestId('create-playlist-context-menu-button').click()
    cy.findByTestId('playlist-context-menu-create-smart').click()

    cy.get('.smart-playlist-form')
      .should('be.visible')
      .within(() => {
        cy.get('[name=name]').should('be.focused').type('My Smart Playlist')
        cy.get('.btn-add-group').click()

        cy.get('[name="model[]"] select').select('Album')
        cy.get('[name="operator[]"] select').select('is')
        cy.get('[name="value[]"]').type('99%')

        // Add a second rule
        cy.get('.add-rule-btn').click()
        cy.get('[name="model[]"] select').last().select('Length')
        cy.get('[name="operator[]"] select').last().select('is greater than')
        cy.wait(0)
        cy.get('[name="value[]"]').last().type('180')

        // Add another group (and rule)
        cy.get('.btn-add-group').click()
        cy.get('.smart-playlist-rule-group:nth-child(2) [name="value[]"]').type('a')

        // Remove a rule from the first group
        cy.get('.smart-playlist-rule-group:nth-child(2) .remove-rule-btn').click()

        cy.get('.smart-playlist-rule-group')
          .should('have.length', 1)

        cy.findByText('Save').click()
      })

    cy.findByText('Playlist "My Smart Playlist" created.').should('be.visible')
    cy.get('#playlistScreen .screen-header').should('be.visible').and('contain', 'My Smart Playlist')

    cy.$assertSidebarItemActive('My Smart Playlist')
    cy.$assertPlaylistSongCount('My Smart Playlist', 6)
  })

  it('updates a smart playlist', () => {
    cy.get('#sidebar').findByText('Smart Playlist').rightclick()
    cy.get('#playlist-context-menu').findByText('Edit…').click()

    cy.get('.smart-playlist-form').should('be.visible').within(() => {
      cy.get('[name=name]').should('be.focused').and('contain.value', 'Smart Playlist').clear().type('A Different Name')

      cy.get('.smart-playlist-rule-group').should('have.length', 1)

      // Add another rule into the second group
      cy.get('.smart-playlist-rule-group .add-rule-btn').click()

      cy.get('.smart-playlist-rule-group [name="model[]"] select').eq(1).select('Album')
      cy.get('.smart-playlist-rule-group [name="operator[]"] select').eq(1).select('contains')
      cy.wait(0)
      cy.get('.smart-playlist-rule-group [name="value[]"]').eq(1).type('keyword')

      cy.get('.smart-playlist-rule-group [name="model[]"]')
        .should('have.length', 2)

      cy.findByText('Save').click()
    })

    cy.findByText('Playlist "A Different Name" updated.').should('be.visible')

    cy.$clickSidebarItem('A Different Name')

    cy.get('#playlistScreen .screen-header').should('be.visible').and('contain', 'A Different Name')
  })

  it('invite user to collection playlist', () => {
    cy.get('#sidebar').findByText('Simple Playlist').as('menuItem').rightclick()
    cy.get('#playlist-context-menu').findByText('Collaborate…').click()

    cy.findByTestId('playlist-collaboration').should('be.visible').within(() => {
      cy.findByText('Invite').click()
      cy.findByText('Link copied to clipboard!').should('be.visible')
    })
  })

  it('user join collection playlist', () => {
    cy.$loginAsNonAdmin()

    cy.intercept('POST', '/api/playlists/collaborators/accept', {
      statusCode: 200,
    })
    cy.intercept('GET', '/api/playlists/**/collaborators', {
      fixture: 'collaborators.get.200.json',
    })
    cy.intercept('/api/playlists/**/songs', {
      fixture: 'playlist-songs.get.200.json',
    })

    cy.visit('/#/playlist/collaborate/ec4a16e1-ec23-4fa3-a610-5ac9ca32b6e8')

    cy.wait(1000)
    cy.visit('/#/playlists/9f4dae6f-dc8a-4af8-9e20-2067de03dff4')

    cy.get('#playlistScreen').within(() => {
      cy.get('.screen-header').should('be.visible').and('contain', 'Simple Playlist')
      cy.$getSongRows().should('have.length', 2)
    })
  })
})
