import 'cypress-file-upload';

context('Uploading', () => {
  beforeEach(() => {
    cy.$login()
    cy.$clickSidebarItem('Upload')
  })

  function assertResultsAdded() {
    cy.findByTestId('upload-item').should('have.length', 1).should('have.class', 'uploaded')
  }

  function selectFixtureFile(fileName = 'audio/sample.mp3') {
    cy.get('[type=file]').attachFile(fileName)

  }

  function executeFailedUpload() {
    cy.intercept('POST', '/api/upload', {
      statusCode: 413,
    }).as('failedUpload')

    selectFixtureFile()
    cy.findByTestId('upload-item').should('have.length', 1).and('be.visible')
    cy.wait('@failedUpload')

    cy.findByTestId('upload-item').should('have.length', 1).should('have.class', 'errored')
  }

  it('uploads songs', () => {
    cy.intercept('POST', '/api/upload', {
      fixture: 'upload.post.200.json',
    }).as('upload')

    cy.get('#uploadScreen').within(() => {
      selectFixtureFile()
      cy.findByTestId('upload-item').should('have.length', 1).and('be.visible')

      cy.wait('@upload')
      cy.findByTestId('upload-item').should('have.length', 1)
    })

    assertResultsAdded()
  })

  it('allows retrying individual failed uploads', () => {
    cy.get('#uploadScreen').within(() => {
      executeFailedUpload()

      cy.intercept('POST', '/api/upload', {
        fixture: 'upload.post.200.json',
      }).as('successfulUpload')

      cy.get('[data-testid=upload-item]:first-child').findByTitle('Retry').click()
      cy.wait('@successfulUpload')
      cy.findByTestId('upload-item').should('have.length', 1)
    })

    assertResultsAdded()
  })

  it('allows retrying all failed uploads at once', () => {
    cy.get('#uploadScreen').within(() => {
      executeFailedUpload()

      cy.intercept('POST', '/api/upload', {
        fixture: 'upload.post.200.json',
      }).as('successfulUpload')

      cy.findByTestId('upload-retry-all-btn').click()
      cy.wait('@successfulUpload')
      cy.findByTestId('upload-item').should('have.length', 1)
    })

    assertResultsAdded()
  })

  it('edit song uploaded', () => {
     cy.intercept('POST', '/api/upload', {
      fixture: 'upload.post.200.json',
    }).as('upload')

    cy.get('#uploadScreen').within(() => {
      selectFixtureFile()
      cy.findByTestId('upload-item').should('have.length', 1).and('be.visible')

      cy.wait('@upload')
      cy.findByTestId('upload-item').should('have.length', 1)
    })

    assertResultsAdded()
    cy.findByTestId('upload-item').findByTitle('Edit').click()

  })

  it('allows removing individual failed uploads', () => {
    cy.get('#uploadScreen').within(() => {
      executeFailedUpload()
      cy.get('[data-testid=upload-item]:first-child').findByTitle('Remove').click()
      cy.findByTestId('upload-item').should('have.length', 0)
    })
  })

  it('allows removing all failed uploads at once', () => {
    cy.get('#uploadScreen').within(() => {
      executeFailedUpload()
      cy.findByTestId('upload-remove-all-btn').click()
      cy.findByTestId('upload-item').should('have.length', 0)
    })
  })
})
