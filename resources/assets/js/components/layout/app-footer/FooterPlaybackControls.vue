<template>
  <div class="playback-controls flex flex-1 flex-col justify-center">
    <div class="flex items-center justify-between md:justify-center gap-5 md:gap-12 px-4 md:px-0">
      <LikeButton v-if="playable" :playable="playable" class="text-base" />
      <button v-else type="button" /> <!-- a placeholder to maintain the asymmetric layout -->

      <FooterBtn class="play-prev-btn text-2xl" title="Play previous in queue" @click.prevent="playPrev">
        <Icon :icon="faStepBackward" />
      </FooterBtn>

      <PlayButton />

      <FooterBtn class="play-next-btn text-2xl" title="Play next in queue" @click.prevent="playNext">
        <Icon :icon="faStepForward" />
      </FooterBtn>

      <RepeatModeSwitch class="text-base" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { faStepBackward, faStepForward } from '@fortawesome/free-solid-svg-icons'
import { ref } from 'vue'
import { playbackService } from '@/services/playbackService'
import { requireInjection } from '@/utils/helpers'
import { CurrentPlayableKey } from '@/symbols'

import RepeatModeSwitch from '@/components/ui/RepeatModeSwitch.vue'
import LikeButton from '@/components/song/SongLikeButton.vue'
import PlayButton from '@/components/ui/FooterPlayButton.vue'
import FooterBtn from '@/components/layout/app-footer/FooterButton.vue'

const playable = requireInjection(CurrentPlayableKey, ref())

const playPrev = async () => await playbackService.playPrev()
const playNext = async () => await playbackService.playNext()
</script>

<style lang="postcss" scoped>
:fullscreen .playback-controls {
  @apply scale-125;
}
</style>
