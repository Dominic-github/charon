interface LoginOptions {
  asAdmin: boolean
  uses_i_tunes?: boolean
  uses_you_tube?: boolean
  uses_spotify?: boolean
  uses_last_fm?: boolean
  allows_download?: boolean
  supports_transcoding?: boolean
}

declare namespace Cypress {
  interface Chainable {
    $login: (options?: Partial<LoginOptions>) => Chainable<AUTWindow>
    $loginAsNonAdmin: (options?: Partial<LoginOptions>) => Chainable<AUTWindow>
    $each: (dataset: Array<Array<any>>, callback: (...args: any) => void) => void
    $confirm: () => void
    $clickSidebarItem: (sidebarItemText: string) => Chainable<JQuery<HTMLElement>>

    /**
     * Mock audio playback, including intercepting the media request, album thumbnail, media info etc.
     */
    $mockPlayback: () => void

    /**
     * Queue several songs from the "All Songs" screen.
     * @param count
     */
    $shuffleSeveralSongs: (count?: number) => void
    $shuffleAllSongs: () => void
    $getSongRows: () => Chainable<JQuery<HTMLElement>>
    $getSongRowAt: (position: number) => Chainable<JQuery<HTMLElement>>

    $assertPlaylistSongCount: (name: string, count: number) => void
    $assertFavoriteSongCount: (count: number) => void
    $selectSongRange: (start: number, end: number, scrollBehavior?: scrollBehaviorOptions) => Chainable<JQuery<HTMLElement>>
    $assertPlaying: () => void
    $assertNotPlaying: () => void
    $assertSidebarItemActive: (text: string) => void

    /**
     * Support finding an element within an element identified with a test ID.
     * For example, given a DOM like this:
     *   <form data-testid="my-form">
     *     <input name="email">
     *   </form>
     * then the input can be accessed with:
     *   cy.$findInTestId('my-form input[name=email]')
     * which is identical to
     *   cy.findByTestId('my-form').find('input[name=email]')
     */
    $findInTestId: <E extends HTMLElement = HTMLElement>(selector: string) => Chainable<JQuery<E>>
  }
}
