import { arrayify } from '@/utils/helpers'
import { useAuthorization } from '@/composables/useAuthorization'
import { resourcePermissionService } from '@/services/resourcePermissionService'

export const usePolicies = () => {
  const { currentUser, isAdmin } = useAuthorization()

  const currentUserCan = {
    editSong: (songs: MaybeArray<Song>) => {
      if (isAdmin.value) {
        return true
      }

      return arrayify(songs).every(song => song.owner_id === currentUser.value.id)
    },

    editPlaylist: (playlist: Playlist) => playlist.owner_id === currentUser.value.id,
    uploadSongs: () => true,
    changeAlbumOrArtistThumbnails: () => isAdmin.value, // the logic is handled in the backend
     editAlbum: async (album: Album) => await resourcePermissionService.check('album', album.id, 'edit'),
    editArtist: async (artist: Artist) => await resourcePermissionService.check('artist', artist.id, 'edit'),
  }

  return {
    currentUserCan,
  }
}
