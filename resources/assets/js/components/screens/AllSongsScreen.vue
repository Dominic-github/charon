<template>
  <ScreenBase id="allSongScreen">
    <template #header>
      <ScreenHeader :layout="songs.length === 0 ? 'collapsed' : headerLayout">
        All Songs
        <ControlsToggle v-model="showingControls" />

        <template #thumbnail>
          <ThumbnailStack :thumbnails="thumbnails" />
        </template>

        <template v-if="totalSongCount" #meta>
          <span>{{ pluralize(totalSongCount, 'song') }}</span>
          <span>{{ totalDuration }}</span>
        </template>

        <template #controls>
          <div class="controls w-full min-h-[32px] flex justify-between items-center gap-4">
            <SongListControls
              v-if="totalSongCount && (!isPhone || showingControls)"
              :config="config"
              @play-all="playAll"
              @play-selected="playSelected"
            />
            <label class="text-k-text-secondary inline-flex items-center text-base">
              <CheckBox v-model="ownSongsOnly" />
              <span>Own songs only</span>
            </label>
          </div>
        </template>
      </ScreenHeader>
    </template>

    <SongListSkeleton v-if="showSkeletons" class="-m-6" />
    <template v-else>
      <SongList
        v-if="songs?.length > 0"
        ref="songList"
        class="-m-6"
        @sort="sort"
        @scroll-breakpoint="onScrollBreakpoint"
        @press:enter="onPressEnter"
        @scrolled-to-end="fetchSongs"
      />
      <ScreenEmptyState v-else>
        <template #icon>
          <Icon :icon="faVolumeOff" />
        </template>
        Your library is empty.
        <a
          v-if="ownSongsOnly"
          class="block secondary"
          role="button"
          @click.prevent="showSongsFromOthers"
        >
          Show public songs from other users?
        </a>
      </ScreenEmptyState>
    </template>
  </ScreenBase>
</template>

<script lang="ts" setup>
import { faVolumeOff } from '@fortawesome/free-solid-svg-icons'
import { computed, ref, toRef, watch } from 'vue'
import { pluralize, secondsToHumanReadable } from '@/utils/formatters'
import { commonStore } from '@/stores/commonStore'
import { queueStore } from '@/stores/queueStore'
import { songStore } from '@/stores/songStore'
import { playbackService } from '@/services/playbackService'
import { useRouter } from '@/composables/useRouter'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useSongList } from '@/composables/useSongList'
import { useSongListControls } from '@/composables/useSongListControls'

import ScreenHeader from '@/components/ui/ScreenHeader.vue'
import SongListSkeleton from '@/components/ui/skeletons/SongListSkeleton.vue'
import CheckBox from '@/components/ui/form/CheckBox.vue'
import ScreenEmptyState from '@/components/ui/ScreenEmptyState.vue'
import ScreenBase from '@/components/screens/ScreenBase.vue'

const totalSongCount = toRef(commonStore.state, 'song_count')
const totalDuration = computed(() => secondsToHumanReadable(commonStore.state.song_length))

const {
  SongList,
  ControlsToggle,
  ThumbnailStack,
  headerLayout,
  thumbnails,
  songs,
  songList,
  showingControls,
  isPhone,
  onPressEnter,
  playSelected,
  onScrollBreakpoint,
} = useSongList(toRef(songStore.state, 'songs'), { type: 'Songs' }, { filterable: false, sortable: true })

const { SongListControls, config } = useSongListControls('Songs')

const { go, onScreenActivated, url } = useRouter()
const { get: lsGet, set: lsSet } = useLocalStorage()

let initialized = false
const loading = ref(false)
let sortField: MaybeArray<PlayableListSortField> = 'title' // @todo get from query string
let sortOrder: SortOrder = 'asc'

const page = ref<number | null>(1)
const moreSongsAvailable = computed(() => page.value !== null)
const showSkeletons = computed(() => loading.value && songs.value.length === 0)

const ownSongsOnly = ref(true ? Boolean(lsGet('own-songs-only')) : false)

const fetchSongs = async () => {
  if (!moreSongsAvailable.value || loading.value) {
    return
  }

  loading.value = true

  try {
    page.value = await songStore.paginate({
      sort: sortField,
      order: sortOrder,
      page: page.value!,
      own_songs_only: ownSongsOnly.value,
    })
  } catch (error: any) {
    useErrorHandler().handleHttpError(error)
  } finally {
    loading.value = false
  }
}

const playAll = async (shuffle: boolean) => {
  if (shuffle) {
    await queueStore.fetchRandom()
  } else {
    await queueStore.fetchInOrder(sortField, sortOrder)
  }

  go(url('queue'))
  await playbackService.playFirstInQueue()
}

const sort = async (field: MaybeArray<PlayableListSortField>, order: SortOrder) => {
  page.value = 1
  songStore.state.songs = []
  sortField = field
  sortOrder = order

  await fetchSongs()
}

watch(ownSongsOnly, async value => {
  lsSet('own-songs-only', value)
  page.value = 1
  songStore.state.songs = []

  await fetchSongs()
})

const showSongsFromOthers = async () => {
  ownSongsOnly.value = false
  await fetchSongs()
}

onScreenActivated('Songs', async () => {
  if (!initialized) {
    initialized = true
    await fetchSongs()
  }
})
</script>

<style lang="postcss" scoped>
.collapsed .controls {
  @apply w-auto;
}
</style>
