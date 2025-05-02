context('Settings', () => {
  beforeEach(() => {
    cy.$login()
    cy.$clickSidebarItem('Settings')
    cy.intercept('PUT', '/api/settings', {}).as('save')
  })

  it('rescans media', () => {
    cy.get('#settingScreen').within(() => {
      cy.get('.screen-header')
        .should('be.visible')
        .and('contain.text', 'Settings')

      cy.get('[name=media_path]').should('have.value', '/media/charon/')
      cy.get('[type=submit]').click()
    })

    cy.wait('@save')
  })

  it('confirms before rescanning if media path is changed', () => {
    cy.get('#settingScreen').within(() => {
      cy.get('[name=media_path]')
        .should('have.value', '/media/charon/')
        .clear()
        .type('/var/media/charon')

      cy.get('[type=submit]').click()
    })

    cy.$confirm()
    cy.wait('@save')
  })
})
