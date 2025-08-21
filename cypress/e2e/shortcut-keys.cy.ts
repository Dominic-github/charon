context('Shortcut Keys', () => {
  beforeEach(() => {
    cy.$login()
    cy.$mockPlayback()
  })

  it('focus into Search input when F is pressed', () => {
    cy.get('body').type('f')
    cy.get('#searchForm [name=q]').should('be.focused')
  })

  it('shuffles all songs by default when Space is pressed', () => {
    cy.intercept('/api/queue/fetch?**', {
      statusCode: 200,
      fixture: 'queue.all.get.200.json',
    })
    cy.get('body').type(' ')
    cy.$assertPlaying()

    cy.get('.queue-btn').should('exist').click()
    cy.get('#queueScreen .song-item').should('have.length', 17)
  })

  it('toggles playback when Space is pressed', () => {
    cy.$shuffleSeveralSongs()
    cy.$assertPlaying()
    cy.get('body').type(' ')
    cy.$assertNotPlaying()

    cy.get('body').type(' ')
    cy.$assertPlaying()
  })

  it('moves back and forward when K and J are pressed', () => {
    cy.$shuffleSeveralSongs()
    cy.get('.queue-btn').should('exist').click()

    cy.wait(2000)

    cy.get('#queueScreen').type('j')
    cy.$getSongRowAt(1).should('have.class', 'playing')

    cy.get('#queueScreen').type('k')
    cy.$getSongRowAt(0).should('have.class', 'playing')
  })

  it('toggles favorite when L is pressed', () => {
    cy.intercept('POST', '/api/interaction/like', {})
    cy.$shuffleSeveralSongs()
    cy.get('.queue-btn').should('exist').click()
    cy.wait(2000)

    cy.get('#queueScreen').type('l')
    cy.get('[data-testid="song-item"] .extra > [data-testid="like-btn"]').first().should('be.visible').and('have.attr', 'title', 'Unlike')

    cy.get('#queueScreen').type('l')
    cy.get('[data-testid="song-item"] .extra > [data-testid="like-btn"]').first().should('be.visible').and('have.attr', 'title', 'Like')
  })
})
