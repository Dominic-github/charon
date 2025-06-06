<template>
  <ScreenBase id="playlistScreen" v-if="playlistId">
    <template #header>
      <ScreenHeader v-if="playlist" :disabled="loading" :layout="songs.length === 0 ? 'collapsed' : headerLayout">
        {{ playlist.name }}
        <ControlsToggle v-if="songs.length" v-model="showingControls" />

        <template #thumbnail>
          <PlaylistThumbnail :playlist="playlist">
            <ThumbnailStack v-if="!playlist.cover" :thumbnails="thumbnails" />
          </PlaylistThumbnail>
        </template>

        <template v-if="songs.length || playlist.is_collaborative" #meta>
          <CollaboratorsBadge v-if="collaborators.length" :collaborators="collaborators" />
          <span>{{ pluralize(songs, 'item') }}</span>
          <span>{{ duration }}</span>
          <a
            v-if="downloadable"
            role="button"
            title="Download all songs in playlist"
            @click.prevent="download"
          >
            Download All
          </a>
        </template>

        <template #controls>
          <SongListControls
            v-if="!isPhone || showingControls"
            :config="controlsConfig"
            @filter="applyFilter"
            @refresh="fetchDetails(true)"
            @delete-playlist="destroy"
            @play-all="playAll"
            @play-selected="playSelected"
          />
        </template>
      </ScreenHeader>
      <ScreenHeaderSkeleton v-else />
    </template>

    <SongListSkeleton v-if="loading" class="-m-6" />
    <template v-else>
      <SongList
        v-if="songs.length"
        ref="songList"
        class="-m-6"
        @reorder="onReorder"
        @sort="sort"
        @press:delete="removeSelected"
        @press:enter="onPressEnter"
        @scroll-breakpoint="onScrollBreakpoint"
      />

      <ScreenEmptyState v-else>
        <template #icon>
          <Icon :icon="faFile" />
        </template>

        <template v-if="playlist?.is_smart">
          <p>
            No songs match the playlist's
            <a class="inline" @click.prevent="editPlaylist">criteria</a>.
          </p>
        </template>
        <template v-else>
          The playlist is currently empty.
          <span class="block secondary">
            Drag songs into its name in the sidebar or use the &quot;Add To…&quot; button to fill it up.
          </span>
        </template>
      </ScreenEmptyState>
    </template>
  </ScreenBase>
</template>

<script lang="ts" setup>
import { faFile } from '@fortawesome/free-regular-svg-icons'
import { differenceBy } from 'lodash'
import { ref, watch } from 'vue'
import { eventBus } from '@/utils/eventBus'
import { pluralize } from '@/utils/formatters'
import { playlistStore } from '@/stores/playlistStore'
import { songStore } from '@/stores/songStore'
import { downloadService } from '@/services/downloadService'
import { playlistCollaborationService } from '@/services/playlistCollaborationService'
import { useRouter } from '@/composables/useRouter'
import { useAuthorization } from '@/composables/useAuthorization'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { usePlaylistManagement } from '@/composables/usePlaylistManagement'
import { useSongList } from '@/composables/useSongList'
import { useSongListControls } from '@/composables/useSongListControls'

import ScreenHeader from '@/components/ui/ScreenHeader.vue'
import ScreenEmptyState from '@/components/ui/ScreenEmptyState.vue'
import SongListSkeleton from '@/components/ui/skeletons/SongListSkeleton.vue'
import CollaboratorsBadge from '@/components/playlist/PlaylistCollaboratorsBadge.vue'
import PlaylistThumbnail from '@/components/ui/PlaylistThumbnail.vue'
import ScreenBase from '@/components/screens/ScreenBase.vue'
import ScreenHeaderSkeleton from '@/components/ui/skeletons/ScreenHeaderSkeleton.vue'

const { currentUser } = useAuthorization()
const { triggerNotFound, getRouteParam, onScreenActivated } = useRouter()

const playlistId = ref<string>()
const playlist = ref<Playlist>()
const loading = ref(false)

const {
  SongList,
  ControlsToggle,
  ThumbnailStack,
  headerLayout,
  songs,
  songList,
  duration,
  downloadable,
  thumbnails,
  selectedPlayables,
  showingControls,
  isPhone,
  context,
  sortField,
  onPressEnter,
  playAll,
  playSelected,
  applyFilter,
  onScrollBreakpoint,
  sort: baseSort,
  config: listConfig,
} = useSongList(ref<Playable[] | CollaborativeSong[]>([]), { type: 'Playlist' })

const { SongListControls, config: controlsConfig } = useSongListControls('Playlist')
const { removeFromPlaylist } = usePlaylistManagement()

const sort = (field: MaybeArray<PlayableListSortField> | null, order: SortOrder) => {
  listConfig.reorderable = field === 'position'

  if (field !== 'position') {
    return baseSort(field, order)
  }

  // To sort by position, we simply re-assign the songs array from the playlist, which maintains the original order.
  songs.value = playlist.value!.playables!
}

const destroy = () => eventBus.emit('PLAYLIST_DELETE', playlist.value!)
const download = () => downloadService.fromPlaylist(playlist.value!)
const editPlaylist = () => eventBus.emit('MODAL_SHOW_EDIT_PLAYLIST_FORM', playlist.value!)

const removeSelected = async () => await removeFromPlaylist(playlist.value!, selectedPlayables.value)
const collaborators = ref<PlaylistCollaborator[]>([])

const fetchDetails = async (refresh = false) => {
  if (loading.value) {
    return
  }

  try {
    loading.value = true;

    [songs.value, collaborators.value] = await Promise.all([
      songStore.fetchForPlaylist(playlist.value!, refresh),
      playlist.value!.is_collaborative
        ? playlistCollaborationService.fetchCollaborators(playlist.value!)
        : Promise.resolve<PlaylistCollaborator[]>([]),
    ])

    sortField.value ??= (playlist.value?.is_smart ? 'title' : 'position')
    sort(sortField.value, 'asc')
  } catch (error: unknown) {
    useErrorHandler().handleHttpError(error)
  } finally {
    loading.value = false
  }
}

const onReorder = (target: Playable, type: MoveType) => {
  playlistStore.moveItemsInPlaylist(playlist.value!, selectedPlayables.value, target, type)
}

watch(playlistId, async id => {
  if (!id) {
    return
  }

  // sort field will be determined later by the playlist's type
  sortField.value = null

  playlist.value = playlistStore.byId(id)
  context.entity = playlist.value

  // reset this config value to its default to not cause rows to be mal-rendered
  listConfig.collaborative = false

  // Since this component is responsible for all playlists, reset these values
  // so that they're not shared between lists
  songs.value = []
  selectedPlayables.value = []

  if (playlist.value) {
    await fetchDetails()
    listConfig.collaborative = playlist.value.is_collaborative
    listConfig.hasCustomOrderSort = !playlist.value.is_smart
    controlsConfig.deletePlaylist = playlist.value.user_id === currentUser.value?.id
  } else {
    await triggerNotFound()
  }
})

onScreenActivated('Playlist', () => (playlistId.value = getRouteParam('id')!))

eventBus
  .on('PLAYLIST_UPDATED', async ({ id }) => id === playlistId.value && await fetchDetails())
  .on('PLAYLIST_COLLABORATOR_REMOVED', async ({ id }) => id === playlistId.value && await fetchDetails())
  .on('PLAYLIST_CONTENT_REMOVED', async ({ id }, removed) => {
    if (id !== playlistId.value) {
      return
    }
    songs.value = differenceBy(songs.value, removed, 'id')
  })
</script>

<style lang="postcss" scoped>
.collapsed .controls {
  @apply w-auto;
}
</style>
