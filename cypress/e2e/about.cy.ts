describe('about Charon', () => {
  beforeEach(() => {
    cy.$login()
  })

  it('should open and close the About modal correctly', () => {
    cy.wait(500)
    cy.get('[id=btn-about]', { timeout: 5000 }).should('be.visible');
    cy.get('[id=btn-about]').click()
    cy.findByTestId('about-charon')
      .should('be.visible')
      .within(() => {
        cy.findByText('Dominic').should('exist')
        cy.findByTestId('close-modal-btn').click()
      })

    cy.findByTestId('about-charon').should('not.exist')
  })
})
