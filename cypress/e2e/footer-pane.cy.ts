context('Footer Pane', () => {
  beforeEach(() => {
    cy.$login()
    cy.$mockPlayback()

    cy.$clickSidebarItem('All Songs')

    cy.$getSongRows().eq(2).dblclick().within(() => {
      cy.get('.title').invoke('text').as('title')
      cy.get('.album').invoke('text').as('album')
      cy.get('.artist').invoke('text').as('artist')
    })
  })

  it('displays current song information', () => {
    cy.get('.song-info').within(function () {
      cy.get('.title').should('have.text', this.title)
      cy.get('.artist').should('have.text', this.artist)
    })
  })

  it('invokes artist screen', () => {
    cy.intercept('GET', '/api/artists/*/songs', { fixture: 'artist-song.get.200.json' })
    cy.get('.song-info').within(() => cy.get('.artist').click())
    cy.get('#artistScreen').should('be.visible')
  })

  it('has a context menu for the current song', () => {
    cy.findByTestId('footer-app').rightclick()
    cy.findByTestId('song-context-menu').should('be.visible')
  })
})
