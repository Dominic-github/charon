context('Other Controls', () => {
  beforeEach(() => {
    cy.$login()
    cy.$mockPlayback()
    cy.$shuffleSeveralSongs(3)
  })

  it('toggles queue', () => {
    cy.get('.extra-controls').should('be.visible')
    cy.get('.queue-btn').as('btn').click()
    cy.url().should('contain', '/#/queue')
    cy.get('.queue-btn').as('btn').click()
    cy.url().should('not.contain', '/#/queue')
  })

  it('toggles the visualizer', () => {
    cy.get('.extra-controls').should('be.visible')
    cy.get('.visualizer-btn').as('btn').click()
    cy.url().should('contain', '/#/visualizer')
    cy.get('.viz').should('be.visible')
    cy.get('.visualizer-btn').as('btn').click()
    cy.url().should('not.contain', '/#/visualizer')
    cy.get('.viz').should('not.exist')
  })

  it('toggles the volume', () => {
    cy.get('.extra-controls').should('be.visible')

    cy.get('#volume').should('be.visible')
    cy.get('#volume .muteVolumeBtn').should('be.visible')
    cy.get('#volume .muteVolumeBtn').as('volumeBtn').click()
    cy.get('#volume .unmuteVolumeBtn').should('be.visible')
    cy.get('#volume .unmuteVolumeBtn').as('unmuteBtn').click()
    cy.get('#volume .muteVolumeBtn').should('be.visible')
  })

  it('toggles the equalizer', () => {
    cy.get('.extra-controls').should('be.visible')
    cy.get('.equalizer').should('be.visible')
    cy.get('.equalizer').click()
    cy.get('#equalizer-container').should('be.visible')
    cy.get('.equalizer-close-btn').click()
    cy.get('#equalizer-container').should('not.exist')
  })
})
