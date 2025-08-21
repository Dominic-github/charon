// causing the first row lost due to virtual scrolling.
context('Queuing', { scrollBehavior: false }, () => {
  const MIN_SONG_ITEMS_SHOWN = 3

  beforeEach(() => {
    cy.$mockPlayback()
    cy.$login()
  })

  function showQueueScreen() {
    cy.$shuffleSeveralSongs(3)
    cy.get('.queue-btn').should('exist').click()
    cy.wait(1000)
  }

  it('allows shuffling all songs', () => {
    showQueueScreen()
    cy.get('#queueScreen').within(() => {
      cy.findByText('Current Queue').should('be.visible')
      cy.findByTestId('btn-shuffle-all').click()
      cy.$getSongRows().should('have.length.at.least', MIN_SONG_ITEMS_SHOWN)
    })

    cy.$assertPlaying()
  })

  it('clears the queue', () => {
    showQueueScreen()
    cy.get('#queueScreen').within(() => {
      cy.findByText('Current Queue').should('be.visible')
      cy.findByTestId('btn-shuffle-all').click()
      cy.$getSongRows().should('have.length.at.least', MIN_SONG_ITEMS_SHOWN)
      cy.get('.screen-header .clear-queue-btn').click()
      cy.get('[data-testid="song-item"]').should('not.exist')
    })
  })

  it('shuffles all from a song list screen', () => {
    cy.$clickSidebarItem('All Songs')

    cy.intercept('/api/queue/fetch?**', {
      statusCode: 200,
      fixture: 'queue.all.get.200.json',
    })

    cy.get('#allSongScreen').within(() => {
      cy.get('.screen-header [data-testid=btn-shuffle-all]').click()
    })

    cy.get('#queueScreen').within(() => {
      cy.$getSongRows().should('have.length.at.least', MIN_SONG_ITEMS_SHOWN).first().should('have.class', 'playing')
    })

    cy.$assertPlaying()
  })

  it('creates a queue from selected songs', () => {
    cy.$shuffleSeveralSongs(3)

    cy.get('#queueScreen').within(() => {
      cy.$getSongRows().should('have.length', 3)
    })
    cy.$assertPlaying()
  })

  it('deletes a song from queue', () => {
    showQueueScreen()

    cy.get('#queueScreen').within(() => {
      cy.$getSongRows().should('have.length', 3)
      cy.$getSongRows().first().type('{backspace}')
      cy.$getSongRows().should('have.length', 2)
    })
  })

  it('queues a song when plays it', () => {
    cy.$shuffleSeveralSongs()
    cy.$clickSidebarItem('All Songs')

    cy.get('#allSongScreen').within(() => {
      cy.$getSongRowAt(4).find('.title').invoke('text').as('title')
      cy.$getSongRowAt(4).dblclick()
    })

    cy.get('.queue-btn').should('exist').click()

    cy.get('#queueScreen').within(function () {
      cy.$getSongRows().should('have.length', 4)
      cy.$getSongRowAt(1).find('.title').should('have.text', this.title)
      cy.$getSongRowAt(1).should('have.class', 'playing')
    })

    cy.$assertPlaying()
  })

  it('navigates through the queue', () => {
    showQueueScreen()

    cy.get('#queueScreen').within(() => {
      cy.$getSongRows().should('have.length', 3)
      cy.$getSongRowAt(0).should('have.class', 'playing')
    })

    cy.get('.play-next-btn').click()
    cy.$getSongRowAt(1).should('have.class', 'playing')

    cy.get('.play-prev-btn').click()
    cy.$getSongRowAt(0).should('have.class', 'playing')
  })

  it('stops playing if reaches end of queue in no-repeat mode', () => {
    cy.$shuffleSeveralSongs(3)

    cy.get('.queue-btn').should('exist').click()
    cy.get('#queueScreen').within(() => {
      cy.$getSongRows().should('have.length', 3)
      cy.$getSongRowAt(0).should('have.class', 'playing')
    })

    cy.wait(1000) // Wait for the song to start playing
    cy.get('.play-next-btn').click({ force: true })
    cy.wait(1000) // Wait for the song to start playing
    cy.get('.play-next-btn').click({ force: true })
    cy.wait(1000) // Wait for the song to start playing
    cy.get('.play-next-btn').click({ force: true })
    cy.$assertNotPlaying()
  })

  it('rotates if reaches end of queue in repeat-all mode', () => {
    cy.findByTestId('repeat-mode-switch').click()

    cy.$shuffleSeveralSongs(3)

    cy.get('.queue-btn').should('exist').click()
    cy.get('#queueScreen').within(() => {
      cy.$getSongRows().should('have.length', 3)
      cy.$getSongRowAt(0).should('have.class', 'playing')
    })

    cy.wait(1000) // Wait for the song to start playing
    cy.get('.play-next-btn').click({ force: true })
    cy.wait(1000) // Wait for the song to start playing
    cy.get('.play-next-btn').click({ force: true })
    cy.wait(1000) // Wait for the song to start playing
    cy.get('.play-next-btn').click({ force: true })

    cy.$assertPlaying()
  })

  it('still moves to next song in repeat-one mode', () => {
    cy.findByTestId('repeat-mode-switch').click()
    cy.findByTestId('repeat-mode-switch').click()

    cy.$shuffleSeveralSongs(3)

    cy.get('.queue-btn').should('exist').click()
    cy.get('#queueScreen').within(() => {
      cy.$getSongRows().should('have.length', 3)
      cy.$getSongRowAt(0).should('have.class', 'playing')
    })

    cy.wait(1000) // Wait for the song to start playing
    cy.get('.play-next-btn').click({ force: true })
    cy.wait(1000) // Wait for the song to start playing
    cy.get('.play-next-btn').click({ force: true })
    cy.wait(1000) // Wait for the song to start playing
    cy.get('.play-next-btn').click({ force: true })

    cy.$assertPlaying()
  })
})
