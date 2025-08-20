context('Song Editing', { scrollBehavior: false }, () => {
  beforeEach(() => {
    cy.intercept('/api/song/**/info', {
      fixture: 'song-info.get.200.json',
    })
    cy.intercept('POST', '/api/broadcasting/auth', {
      statusCode: 200,
    })

    cy.$login()
    cy.$clickSidebarItem('All Songs')
  })

  it('edits a song', () => {
    cy.intercept('PUT', '/api/songs', {
      fixture: 'songs.put.200.json',
    })
    cy.intercept('/api/overview', {
      fixture: 'edit-song.overview.200.json',
    })


    cy.get('#allSongScreen').$getSongRowAt(0).rightclick()
    cy.findByTestId('song-context-menu').within(() => cy.findByText('Edit…').click())

    cy.findByTestId('edit-song-form').within(() => {


      ['artist', 'album', 'track'].forEach((selector) => {
        cy.get(`[name=${selector}]`).should('be.visible')
      })

      cy.get('[name=title]').clear().type('New Title')
      cy.findByTestId('edit-song-lyrics-tab').click()
      cy.findByTestId('lyrics-input').should('be.visible').clear().type('New lyrics{enter}Fake multiline.')

      cy.get('button[type=submit]').click()
    })

    cy.findByText('Updated 1 song.').should('be.visible')
    cy.findByTestId('edit-song-form').should('not.exist')
    cy.$getSongRowAt(0).find('.title').should('have.text', 'New Title')
  })

  it('cancels editing', () => {
    cy.get('#allSongScreen').$getSongRowAt(0).rightclick()
    cy.findByTestId('song-context-menu').within(() => cy.findByText('Edit…').click())

    cy.$findInTestId('edit-song-form .btn-cancel').click()
    cy.findByTestId('edit-song-form').should('not.exist')
  })

  it('edits multiple songs', () => {
    cy.intercept('PUT', '/api/songs', {
      fixture: 'songs-multiple.put.200.json',
    })

    cy.intercept('/api/overview', {
        fixture: 'edit-many-song.overview.get.200.json',
      })

    cy.get('#allSongScreen').within(() => cy.$selectSongRange(0, 3).rightclick())
    cy.findByTestId('song-context-menu').within(() => cy.findByText('Edit…').click())

    cy.findByTestId('edit-song-form').within(() => {
      cy.get(`[name=title]`).should('not.exist')

      cy.get('textarea[name=lyrics]').should('not.exist')
        ;['4 songs selected', 'Mixed Albums'].forEach(text => cy.findByText(text).should('be.visible'))

      cy.get('[name=album]').invoke('attr', 'placeholder').should('contain', 'Leave unchanged')
      cy.get('[name=album]').type('The Wall')

      cy.get('button[type=submit]').click()
    })

    cy.findByText('Updated 4 songs.').should('be.visible')
    cy.findByTestId('edit-song-form').should('not.exist')

      ;[0, 1, 2, 3].forEach(i => cy.get(`#allSongScreen`).$getSongRowAt(i).find('.album').should('have.text', 'The Wall'))
  })
})
