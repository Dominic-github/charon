context('Application Layout', () => {
  it('renders a proper layout', () => {
    cy.$login()
    ;[
      '#mainWrapper',
      '#sidebar',
      '#searchForm',
      '.menu',
      '.playlist',
      '#sideSheet',
      '#btn-about',
      '[data-testid=view-profile-link]',
      '#mainContent',

      '[data-testid=footer-app]',
      '[data-testid=footer-app] .song-info',
      '[data-testid=footer-app] .playback-controls',
      '[data-testid=footer-app] .extra-controls',
    ].forEach(selector => cy.get(selector).should('be.visible'))
  })
})
