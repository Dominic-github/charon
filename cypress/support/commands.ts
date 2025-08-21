import '@testing-library/cypress/add-commands'
import scrollBehaviorOptions = Cypress.scrollBehaviorOptions

Cypress.Commands.add('$login', (options: Partial<LoginOptions> = {}) => {
  window.localStorage.setItem('api-token', 'mock-token')

  const mergedOptions = Object.assign({
    asAdmin: true,
    uses_i_tunes: true,
    uses_you_tube: true,
    uses_spotify: true,
    uses_last_fm: true,
    allows_download: true,
    supports_transcoding: true,
  }, options) as LoginOptions

  cy.fixture(mergedOptions.asAdmin ? 'data.get.200.json' : 'data-non-admin.get.200.json').then((data) => {
    delete mergedOptions.asAdmin
    cy.intercept('/api/data', {
      statusCode: 200,
      body: Object.assign(data, mergedOptions),
    }).as('getData')

    cy.intercept('/api/overview', {
      fixture: 'overview.data.get.200.json',
    }).as('getOverview')

    cy.intercept('/api/songs?**', { fixture: 'songs.get.200.json' })
  }).then(() => {
    return cy.visit('/', { failOnStatusCode: false })
  }).then(() => {
    cy.wait(['@getData', '@getOverview'])
  })
})

Cypress.Commands.add('$loginAsNonAdmin', (options: Partial<LoginOptions> = {}) => {
  return cy.$login({ ...options, asAdmin: false })
})

Cypress.Commands.add('$each', (dataset: Array<Array<any>>, callback: (...args) => void) => {
  dataset.forEach(args => callback(...args))
})

Cypress.Commands.add('$confirm', () => cy.get('.confirm').findByText('OK').click())

Cypress.Commands.add('$findInTestId', (selector: string) => {
  const [testId, ...rest] = selector.split(' ')
  return cy.findByTestId(testId.trim()).find(rest.join(' '))
})

Cypress.Commands.add('$clickSidebarItem', (text: string) =>
  cy.get('[id=sidebar]').findByText(text).click())

Cypress.Commands.add('$mockPlayback', () => {
  cy.intercept('/api/album/**/songs', { fixture: 'album-song.get.200.json' })
  cy.intercept('/api/artist/**/songs', { fixture: 'artist-song.get.200.json' })

  cy.intercept('/api/interaction/play', { fixture: 'play.get.200.json' })
  cy.intercept('GET', '/api/songs/recently-played', { statusCode: 200, fixture: 'recently-played.get.200.json' })

  cy.intercept('/api/song/**/info', { fixture: 'song-info.get.200.json' })

  cy.intercept('/play/**?t=mock-token', {
    fixture: 'audio/sample.mp3,null',
  })

  cy.intercept('POST', '/api/interaction/play', { statusCode: 200, fixture: 'play.post.200.json' })

  cy.intercept('/api/me/preferences', { statusCode: 204 })

  cy.intercept('GET', '/api/artists/**/information', { fixture: 'artist-info.get.200.json' })

  cy.intercept('GET', '/api/albums/**', { fixture: 'album-song.get.200.json' })
  cy.intercept('GET', '/api/albums/**/information', { fixture: 'album-info.get.200.json' })
  cy.intercept('GET', '/api/albums/**/thumbnail', { statusCode: 200, fixture: 'album-thumbnail.get.200.json' })

  cy.intercept('GET', 'api/youtube/search/song/**', { fixture: 'youtube-search.get.200.json' })

  // cy.intercept('DELETE', '/api/me', { statusCode: 404 })

  cy.intercept('PUT', '/api/queue/state', { statusCode: 204 })
  cy.intercept('PUT', '/api/queue/playback-status', { statusCode: 204 })
})

Cypress.Commands.add('$shuffleSeveralSongs', (count = 3) => {
  cy.intercept('/api/songs?**', { fixture: 'songs.get.200.json' })

  cy.$clickSidebarItem('All Songs')
  cy.get('#allSongScreen').within(() => {
    cy.$mockPlayback()
    cy.$getSongRowAt(0).click()
    cy.$getSongRowAt(count - 1).click({ shiftKey: true })
    cy.get('.screen-header [data-testid=btn-shuffle-selected]').click()
  })
  cy.$assertPlaying()
})

Cypress.Commands.add('$shuffleAllSongs', () => {
  cy.intercept('/api/songs?**', { fixture: 'songs.get.200.json' })
  cy.intercept('/api/queue/fetch?**', {
    statusCode: 200,
    fixture: 'queue.all.get.200.json',
  })

  cy.$clickSidebarItem('All Songs')
  cy.get('#allSongScreen').within(() => {
    cy.$mockPlayback()
    cy.get('.screen-header [data-testid=btn-shuffle-all]').click()
  })
  cy.$assertPlaying()
})

Cypress.Commands.add('$assertPlaylistSongCount', (name: string, count: number) => {
  cy.$clickSidebarItem(name)
  cy.get('#playlistScreen .song-item').should('have.length', count)
  cy.go('back')
})

Cypress.Commands.add('$assertFavoriteSongCount', (count: number) => {
  cy.$clickSidebarItem('Favorites')
  cy.get('#favoriteScreen').within(() =>
    cy.get('.song-item').should('have.length', count))
  cy.go('back')
})

Cypress.Commands.add('$selectSongRange', (start: number, end: number, scrollBehavior: scrollBehaviorOptions = false) => {
  cy.$getSongRowAt(start).click()
  return cy.$getSongRowAt(end).click({ scrollBehavior, shiftKey: true })
})

Cypress.Commands.add('$assertPlaying', () => {
  cy.get('[data-testid=pause-btn]').should('exist')
})

Cypress.Commands.add('$assertNotPlaying', () => {
  cy.get('[data-testid=play-btn]').should('exist')
})

Cypress.Commands.add('$assertSidebarItemActive', (text: string) => {
  cy.get('#sidebar .current').findByText(text)
})

Cypress.Commands.add('$getSongRows', () => {
  cy.get('.song-item').then($els => Cypress.$($els).slice(0, 5))
})

Cypress.Commands.add('$getSongRowAt', (position: number) => cy.$getSongRows().eq(position))
