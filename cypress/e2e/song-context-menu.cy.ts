context('Song Context Menu', { scrollBehavior: false }, () => {
  it('plays a song via double-clicking', () => {
    cy.$mockPlayback()
    cy.$login()
    cy.$clickSidebarItem('All Songs')

    cy.get('#allSongScreen').within(() => cy.$getSongRowAt(0).dblclick().should('have.class', 'playing'))
    cy.$assertPlaying()
  })

  it('plays and pauses a song via context menu', () => {
    cy.$mockPlayback()
    cy.$login()
    cy.$clickSidebarItem('All Songs')

    cy.get('#allSongScreen').within(() => cy.$getSongRowAt(0).as('item').rightclick())

    cy.findByTestId('song-context-menu').within(() => cy.findByText('Play').click())
    cy.get('@item').should('have.class', 'playing')
    cy.$assertPlaying()

    cy.get('@item').rightclick()
    cy.findByTestId('song-context-menu').within(() => cy.findByText('Pause').click())
    cy.$assertNotPlaying()
  })

  it('invokes album screen', () => {
    cy.intercept('GET', '/api/albums/**/songs', { fixture: 'album-song.get.200.json' })

    cy.$login()
    cy.$clickSidebarItem('All Songs')

    cy.get('#allSongScreen').within(() => cy.$getSongRowAt(0).rightclick())
    cy.findByTestId('song-context-menu').within(() => cy.findByText('Go to Album').click())

    cy.get('#albumScreen').should('be.visible').within(() => {
      cy.get('.screen-header').should('be.visible')
      cy.get('.song-item').should('have.length.at.least', 16)
    })
  })

  it('invokes artist screen', () => {
    cy.intercept('GET', '/api/artists/**/information', { fixture: 'artist-info.get.200.json' })
    cy.intercept('GET', '/api/artists/**/songs', { fixture: 'artist-song.get.200.json' })

    cy.$login()
    cy.$clickSidebarItem('All Songs')

    cy.get('#allSongScreen').within(() => cy.$getSongRowAt(0).rightclick())
    cy.findByTestId('song-context-menu').within(() => cy.findByText('Go to Artist').click())

    cy.get('#artistScreen').should('be.visible').within(() => {
      cy.get('.screen-header').should('be.visible')
      cy.get('.song-item').should('have.length.at.least', 16)
    })
  })

  ;([
    { menuItem: 'queue-after-current', queuedPosition: 1 },
    { menuItem: 'queue-bottom', queuedPosition: 3 },
    { menuItem: 'queue-top', queuedPosition: 0 }
  ]).forEach(config => {
    it(`queues a song to ${config.menuItem}`, () => {
      cy.$login()
      cy.$shuffleSeveralSongs()
      cy.$clickSidebarItem('All Songs')

      let songTitle
      cy.get('#allSongScreen').within(() => {
        cy.$getSongRowAt(3).find('.title').invoke('text').then(text => (songTitle = text))
        cy.$getSongRowAt(3).rightclick()
      })

      cy.findByTestId('song-context-menu').within(() => {
        cy.wait(1000)
        cy.get('.has-sub').click()
        cy.wait(1000)
        cy.get('.has-sub .submenu').findByTestId(config.menuItem).click()
      })

      cy.get('.queue-btn').should('exist').click()
      cy.wait(1000)
      cy.get('#queueScreen').within(() => {
        cy.get('.song-item').should('have.length', 4)
        cy.$getSongRowAt(config.queuedPosition).find('.title').should('have.text', songTitle)
      })
    })
  })

  ;[
    { name: 'one song', songCount: 1, message: 'Song added into "Simple Playlist."' },
    { name: 'several songs', songCount: 2, message: 'Songs added into "Simple Playlist."' }
  ].forEach((config) => {
    it(`adds ${config.name} into a simple playlist`, () => {
      cy.intercept('/api/playlists/**/songs', {
      fixture: 'playlist-songs.get.200.json',
    })

      cy.intercept('PUT', '/api/playlist/**/sync', {})

      cy.$login()
      cy.$clickSidebarItem('All Songs')

      cy.$assertPlaylistSongCount('Simple Playlist', 2)

      cy.get('#allSongScreen').within(() => {
        if (config.songCount > 1) {
          cy.$selectSongRange(0, config.songCount - 1).rightclick()
        } else {
          cy.$getSongRowAt(0).rightclick()
        }
      })

      cy.findByTestId('song-context-menu')
        .within(() => {
          cy.findByText('Add To').click()
          cy.findByText('Simple Playlist').click()
        })

      cy.findByText(config.message).should('be.visible')

    })
  })

  it('does not have smart playlists as target for adding songs', () => {
    cy.$login()
    cy.$clickSidebarItem('All Songs')
    cy.get('#allSongScreen').within(() => cy.$getSongRowAt(0).rightclick())

    cy.findByTestId('song-context-menu').within(() => {
      cy.findByText('Add To').click()
      cy.findByText('Smart Playlist').should('not.exist')
    })
  })

  it('adds a favorite song from context menu', () => {
    cy.intercept('POST', '/api/interaction/batch/like', {
      fixture: 'batch-like.post.200.json'
    })
    cy.intercept('GET', '/api/songs/favorite', {
      fixture: 'favorites.get.200.json',
    })

    cy.$login()
    cy.$clickSidebarItem('All Songs')
    cy.$assertFavoriteSongCount(3)

    cy.get('#allSongScreen').within(() => cy.$getSongRowAt(4).rightclick())
    cy.findByTestId('song-context-menu').within(() => {
      cy.findByText('Add To').click()
      cy.findByText('Favorites').click()
    })
    cy.$assertFavoriteSongCount(4)


  })

  it('initiates editing a song', () => {
    cy.intercept('/api/**/info', {
      fixture: 'song-info.get.200.json'
    })
    cy.$login()
    cy.$clickSidebarItem('All Songs')
    cy.get('#allSongScreen').within(() => cy.$getSongRowAt(0).rightclick())
    cy.findByTestId('song-context-menu').within(() => cy.findByText('Edit…').click())
    cy.findByTestId('edit-song-form').should('be.visible')
  })

  it('downloads a song', () => {
    cy.intercept('/download/songs?*').as('download')

    cy.$login()
    cy.$clickSidebarItem('All Songs')

    cy.get('#allSongScreen').within(() => cy.$getSongRowAt(0).rightclick())
    cy.findByTestId('song-context-menu').within(() => cy.findByText('Download').click())

  })


  it('does not have a Download item if download is not allowed', () => {
    cy.$login({ allows_download: false })
    cy.$clickSidebarItem('All Songs')

    cy.get('#allSongScreen').within(() => cy.$getSongRowAt(0).rightclick())
    cy.findByTestId('song-context-menu').within(() => cy.findByText('Download').should('not.exist'))
  })

  it('does not have an Edit item if user is not an admin', () => {
    cy.$loginAsNonAdmin()
    cy.$clickSidebarItem('All Songs')

    cy.get('#allSongScreen').within(() => cy.$getSongRowAt(0).rightclick())
    cy.findByTestId('song-context-menu').within(() => cy.findByText('Edit').should('not.exist'))
  })

  it('copies a song\'s URL', () => {
    cy.$login()
    cy.$clickSidebarItem('All Songs')

    cy.window().then(window => cy.spy(window.document, 'execCommand').as('copy'))
    cy.get('#allSongScreen').within(() => cy.$getSongRowAt(0).rightclick())
    cy.findByTestId('song-context-menu').within(() => cy.findByText('Copy Shareable URL').click())
    cy.findByText('URL copied to clipboard.').should('be.visible')
  })
})
