context('Extra Information Panel', () => {
  beforeEach(() => {
    cy.$login()
  })

  it('displays the lyrics as the default panel', () => {
    cy.$shuffleSeveralSongs(3)
    cy.get('[data-testid="lyrics-panel"]').should('be.visible')
  })

  it('displays an option to add lyrics if blank', () => {
    cy.$shuffleSeveralSongs(3)

    cy.get('[data-testid="lyrics-panel"]').should('be.visible').and('contain.text', 'No lyrics found.')

    
    cy.findByTestId('add-lyrics-btn').click()
    cy.findByTestId('edit-song-form').should('be.visible')
    cy.get('#editSongPanelLyrics').should('be.visible')
    cy.findByTestId('lyrics-input').should('be.visible')
  })

  it('displays the artist information', () => {
    cy.$mockPlayback()

    cy.$clickSidebarItem('All Songs')
    cy.get('#allSongScreen').within(() => {
      cy.$getSongRowAt(0).click()
      cy.$getSongRowAt(2).click({ shiftKey: true })
      cy.get('.screen-header [data-testid=btn-shuffle-selected]').click()
    })
    cy.get('#extraTabArtist').click()
    cy.get('#extraPanelArtist').should('be.visible')
  })

  it('displays the `album information', () => {
    cy.$mockPlayback()

    cy.$clickSidebarItem('All Songs')
    cy.get('#allSongScreen').within(() => {
      cy.$getSongRowAt(0).click()
      cy.$getSongRowAt(2).click({ shiftKey: true })
      cy.get('.screen-header [data-testid=btn-shuffle-selected]').click()
    })
    cy.get('#extraTabAlbum').click()
    cy.get('#extraPanelAlbum').should('be.visible')
  })

  // YouTube spec has been handled by youtube.spec.ts
})
