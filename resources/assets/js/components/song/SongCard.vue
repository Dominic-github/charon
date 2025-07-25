<template>
  <article
    :class="{ playing: playable.playback_state === 'Playing' || playable.playback_state === 'Paused' }"
    class="group flex gap-3 py-2 pl-2.5 pr-3 rounded-md items-center bg-k-bg-secondary border border-k-border
    hover:border-white/15 transition-[border-color] duration-200 ease-in-out
    focus:ring-1 focus:ring-k-accent focus-within:ring-1 focus-within:ring-k-accent"
    draggable="true"
    data-testid="song-card"
    tabindex="0"
    @dragstart="onDragStart"
    @contextmenu.prevent="requestContextMenu"
    @dblclick.prevent="play"
  >
    <span class="leading-none">
      <SongThumbnail :playable="playable" />
    </span>
    <main class="flex-1 flex items-start overflow-hidden gap-2">
      <div class="flex-1 space-y-1 overflow-hidden">
        <h3 class="flex gap-2 w-full overflow-hidden">
          <ExternalMark v-if="external" />
          <span class="flex-1 block overflow-hidden text-ellipsis whitespace-nowrap">
            {{ playable.title }}
          </span>
        </h3>
        <p class="text-k-text-secondary text-[0.9rem] opacity-80 overflow-hidden">
          <a
            v-if="isSong(playable)"
            :href="url('artists.show', { id: playable.artist_id })"
            class="!text-k-text-primary hover:!text-k-accent"
          >
            {{ playable.artist_name }}
          </a>
          <a
            v-if="isEpisode(playable)"
            :href="url('podcasts.show', { id: playable.podcast_id })"
            class="!text-k-text-primary hover:!text-k-accent"
          >
            {{ playable.podcast_title }}
          </a>
          - {{ pluralize(playable.play_count, 'play') }}
        </p>
      </div>
      <LikeButton :playable="playable" class="opacity-0 text-k-text-secondary group-hover:opacity-100" />
    </main>
  </article>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { isEpisode, isSong } from '@/utils/typeGuards'
import { eventBus } from '@/utils/eventBus'
import { pluralize } from '@/utils/formatters'
import { playbackService } from '@/services/playbackService'
import { useAuthorization } from '@/composables/useAuthorization'
import { useDraggable } from '@/composables/useDragAndDrop'
import { useRouter } from '@/composables/useRouter'

import SongThumbnail from '@/components/song/SongThumbnail.vue'
import LikeButton from '@/components/song/SongLikeButton.vue'
import ExternalMark from '@/components/ui/ExternalMark.vue'

const props = defineProps<{ playable: Playable }>()
const { playable } = toRefs(props)

const { currentUser } = useAuthorization()
const { startDragging } = useDraggable('playables')
const { url } = useRouter()

const external = computed(() => {
  if (!isSong(playable.value)) {
    return false
  }
  return playable.value.owner_id !== currentUser.value?.id
})

const requestContextMenu = (event: MouseEvent) => eventBus.emit(
  'PLAYABLE_CONTEXT_MENU_REQUESTED',
  event,
  playable.value,
)

const onDragStart = (event: DragEvent) => startDragging(event, [playable.value])
const play = () => playbackService.play(playable.value)
</script>

<style lang="postcss" scoped>
article {
  &.playing {
    @apply text-k-accent;
  }

  /* show the thumbnail's playback control on the whole card focus and hover */

  &:hover :deep(.song-thumbnail),
  &:focus :deep(.song-thumbnail) {
    &::before {
      @apply opacity-70;
    }
  }
}
</style>
