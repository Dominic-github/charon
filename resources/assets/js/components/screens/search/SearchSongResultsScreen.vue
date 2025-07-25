<template>
  <ScreenBase id="searchSongResultsScreen">
    <template #header>
      <ScreenHeader :layout="songs.length === 0 ? 'collapsed' : headerLayout">
        <span>Results for <span class="font-thin">{{ decodedQ }}</span></span>
        <ControlsToggle v-model="showingControls" />

        <template #thumbnail>
          <ThumbnailStack :thumbnails="thumbnails" />
        </template>

        <template v-if="songs.length" #meta>
          <span>{{ pluralize(songs, 'item') }}</span>
          <span>{{ duration }}</span>
        </template>

        <template #controls>
          <SongListControls
            v-if="songs.length && (!isPhone || showingControls)"
            :config="config"
            @filter="applyFilter"
            @play-all="playAll"
            @play-selected="playSelected"
          />
        </template>
      </ScreenHeader>
    </template>

    <SongListSkeleton v-if="loading" class="-m-6" />
    <SongList
      v-else
      ref="songList"
      class="-m-6"
      @press:enter="onPressEnter"
      @scroll-breakpoint="onScrollBreakpoint"
    />
  </ScreenBase>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, toRef } from 'vue'
import { searchStore } from '@/stores/searchStore'
import { useSongList } from '@/composables/useSongList'
import { useSongListControls } from '@/composables/useSongListControls'
import { useRouter } from '@/composables/useRouter'
import { pluralize } from '@/utils/formatters'

import ScreenHeader from '@/components/ui/ScreenHeader.vue'
import SongListSkeleton from '@/components/ui/skeletons/SongListSkeleton.vue'
import ScreenBase from '@/components/screens/ScreenBase.vue'

const { getRouteParam } = useRouter()
const q = ref('')

const {
  SongList,
  ControlsToggle,
  ThumbnailStack,
  headerLayout,
  songs,
  songList,
  thumbnails,
  duration,
  showingControls,
  isPhone,
  onPressEnter,
  playAll,
  playSelected,
  applyFilter,
  onScrollBreakpoint,
} = useSongList(toRef(searchStore.state, 'playables'), { type: 'Search.Songs' })

const { SongListControls, config } = useSongListControls('Search.Songs')
const decodedQ = computed(() => decodeURIComponent(q.value))
const loading = ref(false)

searchStore.resetPlayableResultState()

onMounted(async () => {
  q.value = getRouteParam('q') || ''
  if (!q.value) {
    return
  }

  loading.value = true
  await searchStore.playableSearch(q.value)
  loading.value = false
})
</script>
