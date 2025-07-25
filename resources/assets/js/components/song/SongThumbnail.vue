<template>
  <button
    :style="{ backgroundImage: `url(${defaultCover})` }"
    :title="title"
    data-testid="song-thumbnail"
    class="song-thumbnail w-[48px] aspect-square bg-cover relative rounded overflow-hidden active:scale-95"
    @click.prevent="playOrPause"
  >
    <img
      v-charon-hide-broken-icon
      alt="Cover image"
      :src="src"
      class="w-full aspect-square object-cover"
      loading="lazy"
    >
    <span class="absolute top-0 left-0 w-full h-full group-hover:bg-black/40 no-hover:bg-black/40 z-10" />
    <span
      class="absolute flex opacity-0 no-hover:opacity-100 items-center justify-center w-[24px] aspect-square rounded-full top-1/2
        left-1/2 -translate-x-1/2 -translate-y-1/2 bg-k-highlight group-hover:opacity-100 duration-500 transition z-20"
    >
      <Icon v-if="playable.playback_state === 'Playing'" :icon="faPause" class="text-white" />
      <Icon data-testid="play-btn" v-else :icon="faPlay" class="text-white ml-0.5" />
    </span>
  </button>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import defaultCover from '@/../img/covers/default.svg'
import { playbackService } from '@/services/playbackService'
import { getPlayableProp } from '@/utils/helpers'

const props = defineProps<{ playable: Playable }>()
const { playable } = toRefs(props)

const src = computed(() => getPlayableProp<string>(playable.value, 'album_cover', 'episode_image'))

const play = () => playbackService.play(playable.value)

const title = computed(() => {
  if (playable.value.playback_state === 'Playing') {
    return 'Pause'
  }

  if (playable.value.playback_state === 'Paused') {
    return 'Resume'
  }

  return 'Play'
})

const playOrPause = async () => {
  if (playable.value.playback_state === 'Stopped') {
    // @todo play at the right playback position for Episodes
    await play()
  } else if (playable.value.playback_state === 'Paused') {
    await playbackService.resume()
  } else {
    playbackService.pause()
  }
}
</script>
