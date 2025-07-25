<template>
  <aside
    :class="{ 'showing-pane': activeTab }"
    class="fixed sm:relative top-0 w-screen md:w-auto flex flex-col md:flex-row-reverse z-[2] text-k-text-secondary"
    id="sideSheet"
  >
    <div
      class="controls flex md:flex-col justify-between items-center md:w-[64px] md:py-6 tw:px-0
      bg-black/5 md:border-l border-solid md:border-l-white/5 md:border-b-0 md:shadow-none
      z-[2] w-screen flex-row border-b border-b-white/5 border-l-0 shadow-xl
      py-0 px-6 h-k-header-height"
    >
      <div class="btn-group">
        <SideSheetButton class="md:hidden" @click.prevent="expandSidebar">
          <Icon :icon="faBars" fixed-width />
        </SideSheetButton>
        <SideSheetTabHeader v-if="songPlaying" v-model="activeTab" />
      </div>

      <div class="btn-group">
        <AboutCharonButton />
        <LogoutButton />
        <ProfileAvatar @click="onProfileLinkClick" />
      </div>
    </div>

    <div v-if="songPlaying" v-show="activeTab" data-testid="side-sheet-panels" class="panes py-8 px-6 overflow-auto bg-k-bg-secondary">
      <div
        v-show="activeTab === 'Lyrics'"
        id="extraPanelLyrics"
        aria-labelledby="extraTabLyrics"
        role="tabpanel"
        tabindex="0"
      >
        <LyricsPane v-if="playable" :song="playable" />
      </div>

      <div
        v-show="activeTab === 'Artist'"
        id="extraPanelArtist"
        aria-labelledby="extraTabArtist"
        role="tabpanel"
        tabindex="0"
      >
        <ArtistInfo v-if="artist" :artist="artist" mode="aside" />
        <span v-else>Loading…</span>
      </div>

      <div
        v-show="activeTab === 'Album'"
        id="extraPanelAlbum"
        aria-labelledby="extraTabAlbum"
        role="tabpanel"
        tabindex="0"
      >
        <AlbumInfo v-if="album" :album="album" mode="aside" />
        <span v-else>Loading…</span>
      </div>

      <div
        v-show="activeTab === 'YouTube'"
        id="extraPanelYouTube"
        aria-labelledby="extraTabYouTube"
        data-testid="side-sheet-youtube"
        role="tabpanel"
        tabindex="0"
      >
        <YouTubeVideoList v-if="shouldShowYouTubeTab && playable" :song="playable" />
      </div>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import isMobile from 'ismobilejs'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import type { Ref } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'
import { albumStore } from '@/stores/albumStore'
import { artistStore } from '@/stores/artistStore'
import { preferenceStore } from '@/stores/preferenceStore'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useThirdPartyServices } from '@/composables/useThirdPartyServices'
import { eventBus } from '@/utils/eventBus'
import { isSong } from '@/utils/typeGuards'
import { defineAsyncComponent, requireInjection } from '@/utils/helpers'
import { CurrentPlayableKey } from '@/symbols'

import ProfileAvatar from '@/components/ui/ProfileAvatar.vue'
import AboutCharonButton from '@/components/layout/main-wrapper/side-sheet/AboutCharonButton.vue'
import LogoutButton from '@/components/layout/main-wrapper/side-sheet/LogoutButton.vue'
import SideSheetButton from '@/components/layout/main-wrapper/side-sheet/SideSheetButton.vue'

const LyricsPane = defineAsyncComponent(() => import('@/components/ui/LyricsPane.vue'))
const ArtistInfo = defineAsyncComponent(() => import('@/components/artist/ArtistInfo.vue'))
const AlbumInfo = defineAsyncComponent(() => import('@/components/album/AlbumInfo.vue'))
const YouTubeVideoList = defineAsyncComponent(() => import('@/components/ui/youtube/YouTubeVideoList.vue'))
const SideSheetTabHeader = defineAsyncComponent(() => import('./SideSheetTabHeader.vue'))

const { useYouTube } = useThirdPartyServices()

const playable = requireInjection(CurrentPlayableKey, ref(undefined)) as Ref<Song | undefined>
const activeTab = ref<ExtraPanelTab | null>(null)

const artist = ref<Artist>()
const album = ref<Album>()

const songPlaying = computed(() => playable.value && isSong(playable.value))
const shouldShowYouTubeTab = computed(() => useYouTube.value && songPlaying.value)

const fetchSongInfo = async (song: Song) => {
  playable.value = song
  artist.value = undefined
  album.value = undefined

  try {
    artist.value = await artistStore.resolve(song.artist_id)
    album.value = await albumStore.resolve(song.album_id)
  } catch (error: unknown) {
    useErrorHandler().handleHttpError(error)
  }
}

watch(playable, song => {
  if (!song || !isSong(song)) {
    return
  }
  fetchSongInfo(song)
}, { immediate: true })

watch(activeTab, tab => (preferenceStore.active_extra_panel_tab = tab))

const onProfileLinkClick = () => isMobile.any && (activeTab.value = null)
const expandSidebar = () => eventBus.emit('TOGGLE_SIDEBAR')

onMounted(() => isMobile.any || (activeTab.value = preferenceStore.active_extra_panel_tab))
</script>

<style lang="postcss" scoped>
@import '@/../css/partials/mixins.pcss';

@tailwind utilities;

@layer utilities {
  .btn-group {
    @apply flex md:flex-col justify-between items-center gap-1 md:gap-3;
  }
}

aside {
  @media screen and (max-width: 768px) {
    @mixin themed-background;

    &.showing-pane {
      height: 100%;
    }
  }
}

.panes {
  @apply no-hover:overflow-y-auto w-k-side-sheet-width;

  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.1);

  @media screen and (max-width: 768px) {
    width: 100%;
    height: calc(100vh - var(--header-height) - var(--footer-height));
  }
}
</style>
