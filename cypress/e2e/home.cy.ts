context('Home Screen', () => {
  beforeEach(() => {
    cy.clock()
    cy.$login()
    cy.tick(100)
  })

  it('renders', () => {
    cy.get('.screen-header').should('be.visible')
    cy.$each([
      ['most-played-songs', 7],
      ['recently-played-songs', 7],
      ['recently-added-albums', 4],
      ['recently-added-songs', 10],
      ['most-played-artists', 4],
      ['most-played-albums', 4],
    ], (selector: string, itemCount: number) => {
      cy.get(`[data-testid=${selector}]`).should('exist').find('li').should('have.length', itemCount)
    })
  })

  it('has a link to view all recently-played songs', () => {
    cy.get('[data-testid="home-view-all-recently-played-btn"]').click().url().should('contain', '/#/recently-played')
  })

  it('a song item can be played', () => {
    cy.$mockPlayback()
    cy.get('[data-testid="most-played-songs"] > .space-y-3 > :nth-child(1) > [data-testid="song-card"]').within(() => {
      cy.get('.leading-none > [data-testid="song-thumbnail"]').click()
    }).should('have.class', 'playing')
    cy.$assertPlaying()
  
  })

  it('a song item has a context menu', () => {
    cy.get('[data-testid="most-played-songs"] > .space-y-3 > :nth-child(1) > [data-testid="song-card"]').rightclick()
    cy.findByTestId('song-context-menu').should('be.visible')
  })
})
