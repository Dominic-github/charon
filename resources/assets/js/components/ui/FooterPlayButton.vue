<template>
  <FooterButton
    :title="playing ? 'Pause' : 'Play or resume'"
    class="!w-[3rem] rounded-full border-2 border-solid aspect-square !transition-transform hover:scale-125 !text-2xl
    has-[.icon-play]:indent-[0.23rem]"
    data-testid="footer-play-button"
    @click.prevent="toggle"
  >
    <Icon v-if="playing" data-testid="pause-btn" :icon="faPause" />
    <Icon v-else data-testid="play-btn" :icon="faPlay" class="icon-play" />
  </FooterButton>
</template>

<script lang="ts" setup>
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import { computed, ref } from 'vue'
import { playbackService } from '@/services/playbackService'
import { commonStore } from '@/stores/commonStore'
import { favoriteStore } from '@/stores/favoriteStore'
import { queueStore } from '@/stores/queueStore'
import { recentlyPlayedStore } from '@/stores/recentlyPlayedStore'
import { songStore } from '@/stores/songStore'
import { useRouter } from '@/composables/useRouter'
import { requireInjection } from '@/utils/helpers'
import { CurrentPlayableKey } from '@/symbols'

import FooterButton from '@/components/layout/app-footer/FooterButton.vue'

const { getCurrentScreen, getRouteParam, go, url } = useRouter()
const song = requireInjection(CurrentPlayableKey, ref())

const libraryEmpty = computed(() => commonStore.state.song_count === 0)
const playing = computed(() => song.value?.playback_state === 'Playing')

const initiatePlayback = async () => {
  if (libraryEmpty.value) {
    return
  }

  let playables: Playable[]

  switch (getCurrentScreen()) {
    case 'Album':
      playables = await songStore.fetchForAlbum(Number.parseInt(getRouteParam('id')!))
      break
    case 'Artist':
      playables = await songStore.fetchForArtist(Number.parseInt(getRouteParam('id')!))
      break
    case 'Playlist':
      playables = await songStore.fetchForPlaylist(getRouteParam('id')!)
      break
    case 'Favorites':
      playables = await favoriteStore.fetch()
      break
    case 'RecentlyPlayed':
      playables = await recentlyPlayedStore.fetch()
      break
    default:
      playables = await queueStore.fetchRandom()
      break
  }

  await playbackService.queueAndPlay(playables)
  go(url('queue'))
}

const toggle = async () => song.value ? playbackService.toggle() : initiatePlayback()
</script>
