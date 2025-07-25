<template>
  <article>
    <main class="relative" data-testid="lyrics-panel">
      <template v-if="song">
        <div v-show="song.lyrics" class="relative">
          <pre class="font-sans whitespace-pre-wrap leading-relaxed pt-12">{{ lyrics }}</pre>
          <span class="magnifier-wrapper opacity-0 absolute top-0 right-0 hover:!opacity-100">
            <Magnifier @in="zoomIn" @out="zoomOut" />
          </span>
        </div>
        <p v-if="song.id && !song.lyrics" class="text-k-text-secondary">
          <template v-if="canUpdateLyrics">
            No lyrics found.
            <a role="button" data-testid="add-lyrics-btn" @click.prevent="showEditSongForm">
              Click here
            </a>
            to add lyrics.
          </template>
          <span v-else>No lyrics available. Are you listening to Bach?</span>
        </p>
      </template>
    </main>
  </article>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, toRefs, watch } from 'vue'
import { cr2lf } from '@/utils/formatters'
import { eventBus } from '@/utils/eventBus'
import { usePolicies } from '@/composables/usePolicies'
import { preferenceStore as preferences } from '@/stores/preferenceStore'

const props = defineProps<{ song: Song }>()

const Magnifier = defineAsyncComponent(() => import('@/components/ui/Magnifier.vue'))

const { song } = toRefs(props)

const { currentUserCan } = usePolicies()

const canUpdateLyrics = currentUserCan.editSong(song.value)
const zoomLevel = ref(preferences.lyrics_zoom_level || 1)

const lyrics = computed(() => cr2lf(song.value.lyrics))
const fontSize = computed(() => `${1 + (zoomLevel.value - 1) * 0.2}rem`)

const zoomIn = () => (zoomLevel.value = Math.min(zoomLevel.value + 1, 8))
const zoomOut = () => (zoomLevel.value = Math.max(zoomLevel.value - 1, -2))
const showEditSongForm = () => eventBus.emit('MODAL_SHOW_EDIT_SONG_FORM', song.value, 'lyrics')

watch(zoomLevel, level => (preferences.lyrics_zoom_level = level), { immediate: true })
</script>

<style lang="postcss" scoped>
main {
  .magnifier-wrapper {
    @apply no-hover:opacity-100;
  }

  &:hover .magnifier-wrapper {
    @apply opacity-50;
  }
}

pre {
  font-size: v-bind(fontSize);
}
</style>
