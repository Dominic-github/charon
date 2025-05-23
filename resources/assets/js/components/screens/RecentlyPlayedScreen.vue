<template>
  <ScreenBase id="recentlyPlayedScreen">
    <template #header>
      <ScreenHeader :layout="songs.length === 0 ? 'collapsed' : headerLayout">
        Recently Played
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
      v-if="songs.length"
      ref="songList"
      class="-m-6"
      @press:enter="onPressEnter"
      @scroll-breakpoint="onScrollBreakpoint"
    />

    <ScreenEmptyState v-else>
      <template #icon>
        <Icon :icon="faClock" />
      </template>
      No songs recently played.
      <span class="secondary block">Start playing to populate this playlist.</span>
    </ScreenEmptyState>
  </ScreenBase>
</template>

<script lang="ts" setup>
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { ref, toRef } from 'vue'
import { pluralize } from '@/utils/formatters'
import { recentlyPlayedStore } from '@/stores/recentlyPlayedStore'
import { useRouter } from '@/composables/useRouter'
import { useSongList } from '@/composables/useSongList'
import { useSongListControls } from '@/composables/useSongListControls'

import ScreenHeader from '@/components/ui/ScreenHeader.vue'
import ScreenEmptyState from '@/components/ui/ScreenEmptyState.vue'
import SongListSkeleton from '@/components/ui/skeletons/SongListSkeleton.vue'
import ScreenBase from '@/components/screens/ScreenBase.vue'

const recentlyPlayedSongs = toRef(recentlyPlayedStore.state, 'playables')

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
} = useSongList(recentlyPlayedSongs, { type: 'RecentlyPlayed' }, { sortable: false })

const { SongListControls, config } = useSongListControls('RecentlyPlayed')

let initialized = false
const loading = ref(false)

useRouter().onScreenActivated('RecentlyPlayed', async () => {
  if (!initialized) {
    loading.value = true
    initialized = true
    await recentlyPlayedStore.fetch()
    loading.value = false
  }
})
</script>
