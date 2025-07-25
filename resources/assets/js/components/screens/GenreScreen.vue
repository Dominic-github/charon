<template>
  <ScreenBase id="genreScreen">
    <template #header>
      <ScreenHeader v-if="genre" :layout="headerLayout">
        <span>Genre: <span class="text-thin">{{ decodeURIComponent(name!) }}</span></span>
        <ControlsToggle v-if="songs.length" v-model="showingControls" />

        <template #thumbnail>
          <ThumbnailStack :thumbnails="thumbnails" />
        </template>

        <template v-if="genre" #meta>
          <span>{{ pluralize(genre.song_count, 'song') }}</span>
          <span>{{ duration }}</span>
        </template>

        <template #controls>
          <SongListControls
            v-if="!isPhone || showingControls"
            :config="config"
            @play-all="playAll"
            @play-selected="playSelected"
          />
        </template>
      </ScreenHeader>
      <ScreenHeaderSkeleton v-else />
    </template>

    <SongListSkeleton v-if="showSkeletons" class="-m-6" />
    <SongList
      v-else
      ref="songList"
      class="-m-6"
      @sort="fetchWithSort"
      @press:enter="onPressEnter"
      @scroll-breakpoint="onScrollBreakpoint"
      @scrolled-to-end="fetch"
    />

    <ScreenEmptyState v-if="!songs.length && !loading">
      <template #icon>
        <GuitarIcon size="96" />
      </template>

      No songs in this genre.
    </ScreenEmptyState>
  </ScreenBase>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { GuitarIcon } from 'lucide-vue-next'
import { pluralize, secondsToHumanReadable } from '@/utils/formatters'
import { eventBus } from '@/utils/eventBus'
import { playbackService } from '@/services/playbackService'
import { genreStore } from '@/stores/genreStore'
import { songStore } from '@/stores/songStore'
import { useRouter } from '@/composables/useRouter'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useSongList } from '@/composables/useSongList'
import { useSongListControls } from '@/composables/useSongListControls'

import ScreenHeader from '@/components/ui/ScreenHeader.vue'
import ScreenEmptyState from '@/components/ui/ScreenEmptyState.vue'
import SongListSkeleton from '@/components/ui/skeletons/SongListSkeleton.vue'
import ScreenHeaderSkeleton from '@/components/ui/skeletons/ScreenHeaderSkeleton.vue'
import ScreenBase from '@/components/screens/ScreenBase.vue'

const {
  SongList,
  ControlsToggle,
  ThumbnailStack,
  headerLayout,
  songs,
  songList,
  thumbnails,
  showingControls,
  isPhone,
  onPressEnter,
  playSelected,
  onScrollBreakpoint,
} = useSongList(ref<Song[]>([]), { type: 'Genre' }, { sortable: true, filterable: false })

const { SongListControls, config } = useSongListControls('Genre')

const { getRouteParam, go, onRouteChanged, url } = useRouter()

let sortField: MaybeArray<PlayableListSortField> = 'title'
let sortOrder: SortOrder = 'asc'

const randomSongCount = 500
const name = ref<string | null>(null)
const genre = ref<Genre | null>(null)
const loading = ref(false)
const page = ref<number | null>(1)

const moreSongsAvailable = computed(() => page.value !== null)
const showSkeletons = computed(() => loading.value && songs.value.length === 0)
const duration = computed(() => secondsToHumanReadable(genre.value?.length ?? 0))

const fetch = async () => {
  if (!moreSongsAvailable.value || loading.value) {
    return
  }

  loading.value = true

  try {
    let fetched: { songs: Playable[], nextPage: number | null }

    [genre.value, fetched] = await Promise.all([
      genreStore.fetchOne(name.value!),
      songStore.paginateForGenre(name.value!, {
        sort: sortField,
        order: sortOrder,
        page: page.value!,
      }),
    ])

    page.value = fetched.nextPage
    songs.value.push(...fetched.songs)
  } catch (error: unknown) {
    useErrorHandler('dialog').handleHttpError(error)
  } finally {
    loading.value = false
  }
}

const refresh = async () => {
  genre.value = null
  page.value = 1
  songs.value = []

  await fetch()
}

const fetchWithSort = async (field: MaybeArray<PlayableListSortField>, order: SortOrder) => {
  page.value = 1
  songs.value = []
  sortField = field
  sortOrder = order

  await fetch()
}

const getNameFromRoute = () => getRouteParam('name') ?? null

onRouteChanged(route => {
  if (route.screen !== 'Genre') {
    return
  }
  name.value = getNameFromRoute()
})

const playAll = async () => {
  if (!genre.value) {
    return
  }

  // we ignore the queueAndPlay's await to avoid blocking the UI
  if (genre.value!.song_count <= randomSongCount) {
    playbackService.queueAndPlay(songs.value, true)
  } else {
    playbackService.queueAndPlay(await songStore.fetchRandomForGenre(genre.value!, randomSongCount))
  }

  go(url('queue'))
}

onMounted(() => (name.value = getNameFromRoute()))

watch(name, async () => name.value && await refresh())

// We can't really tell how/if the genres have been updated, so we just refresh the list
eventBus.on('SONGS_UPDATED', async () => genre.value && await refresh())
</script>
