import { screen, waitFor } from '@testing-library/vue'
import { expect, it } from 'vitest'
import UnitTestCase from '@/__tests__/UnitTestCase'
import factory from '@/__tests__/factory'
import { albumStore } from '@/stores/albumStore'
import { commonStore } from '@/stores/commonStore'
import { preferenceStore } from '@/stores/preferenceStore'
import AlbumListScreen from './AlbumListScreen.vue'

new class extends UnitTestCase {
  protected beforeEach () {
    super.beforeEach(() => this.mock(albumStore, 'paginate'))
  }

  protected test () {
    it('renders', async () => {
      await this.renderComponent()
      expect(screen.getAllByTestId('album-card')).toHaveLength(9)
    })

    it('shows a message when the library is empty', async () => {
      commonStore.state.song_length = 0
      await this.renderComponent()

      await waitFor(() => screen.getByTestId('screen-empty-state'))
    })

    it.each<[ArtistAlbumViewMode]>([['list'], ['thumbnails']])('sets layout from preferences', async mode => {
      preferenceStore.albums_view_mode = mode

      await this.renderComponent()

      await waitFor(() => expect(screen.getByTestId('album-grid').classList.contains(`as-${mode}`)).toBe(true))
    })

    it('switches layout', async () => {
      await this.renderComponent()

      await this.user.click(screen.getByRole('radio', { name: 'View as list' }))
      await waitFor(() => expect(screen.getByTestId('album-grid').classList.contains(`as-list`)).toBe(true))

      await this.user.click(screen.getByRole('radio', { name: 'View as thumbnails' }))
      await waitFor(() => expect(screen.getByTestId('album-grid').classList.contains(`as-thumbnails`)).toBe(true))
    })
  }

  private async renderComponent () {
    albumStore.state.albums = factory('album', 9)

    this.render(AlbumListScreen, {
      global: {
        stubs: {
          AlbumCard: this.stub('album-card'),
        },
      },
    })

    await this.router.activateRoute({ path: 'albums', screen: 'Albums' })
  }
}
