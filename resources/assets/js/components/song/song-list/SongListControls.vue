<template>
  <div class="relative" data-testid="song-list-controls">
    <div class="flex gap-2 flex-wrap">
      <BtnGroup uppercase>
        <template v-if="altPressed">
          <Btn
            v-if="selectedPlayables.length < 2 && filteredPlayables.length"
            v-charon-tooltip.bottom
            class="btn-play-all"
            highlight
            title="Play all. Press Alt/⌥ to change mode."
            @click.prevent="playAll"
          >
            <Icon :icon="faPlay" fixed-width />
            All
          </Btn>

          <Btn
            v-if="selectedPlayables.length > 1"
            v-charon-tooltip.bottom
            class="btn-play-selected"
            highlight
            title="Play selected. Press Alt/⌥ to change mode."
            @click.prevent="playSelected"
          >
            <Icon :icon="faPlay" fixed-width />
            Selected
          </Btn>
        </template>

        <template v-else>
          <Btn
            v-if="selectedPlayables.length < 2 && filteredPlayables.length"
            v-charon-tooltip.bottom
            class="btn-shuffle-all"
            data-testid="btn-shuffle-all"
            highlight
            title="Shuffle all. Press Alt/⌥ to change mode."
            @click.prevent="shuffle"
          >
            <Icon :icon="faRandom" fixed-width />
            All
          </Btn>

          <Btn
            v-if="selectedPlayables.length > 1"
            v-charon-tooltip.bottom
            class="btn-shuffle-selected"
            data-testid="btn-shuffle-selected"
            highlight
            title="Shuffle selected. Press Alt/⌥ to change mode."
            @click.prevent="shuffleSelected"
          >
            <Icon :icon="faRandom" fixed-width />
            Selected
          </Btn>
        </template>

        <Btn
          v-if="showAddToButton"
          ref="addToButton"
          data-testid="add-to-btn"
          success
          @click.prevent.stop="toggleAddToMenu"
        >
          {{ showingAddToMenu ? 'Cancel' : 'Add To…' }}
        </Btn>

        <Btn v-if="config.clearQueue" class="clear-queue-btn" danger title="Clear current queue" @click.prevent="clearQueue">Clear</Btn>
      </BtnGroup>

      <BtnGroup v-if="config.refresh || config.deletePlaylist">
        <Btn v-if="config.refresh" v-charon-tooltip success title="Refresh" @click.prevent="refresh">
          <Icon :icon="faRotateRight" fixed-width />
        </Btn>

        <Btn
          v-if="config.deletePlaylist"
          v-charon-tooltip
          class="del btn-delete-playlist"
          danger
          title="Delete this playlist"
          @click.prevent="deletePlaylist"
        >
          <Icon :icon="faTrashCan" />
        </Btn>
      </BtnGroup>

      <BtnGroup v-if="config.filter && allPlayables.length">
        <SongListFilter @change="filter" />
      </BtnGroup>
    </div>

    <OnClickOutside @trigger="closeAddToMenu">
      <div ref="addToMenu" class="context-menu p-0 hidden">
        <AddToMenu :config="config.addTo" :playables="selectedPlayables" @closing="closeAddToMenu" />
      </div>
    </OnClickOutside>
  </div>
</template>

<script lang="ts" setup>
import { faPlay, faRandom, faRotateRight, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import type { Ref } from 'vue'
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue'
import { OnClickOutside } from '@vueuse/components'
import { FilteredPlayablesKey, PlayablesKey, SelectedPlayablesKey } from '@/symbols'
import { requireInjection } from '@/utils/helpers'
import { useFloatingUi } from '@/composables/useFloatingUi'

import AddToMenu from '@/components/song/AddToMenu.vue'
import Btn from '@/components/ui/form/Btn.vue'
import BtnGroup from '@/components/ui/form/BtnGroup.vue'

const props = defineProps<{ config: SongListControlsConfig }>()

const emit = defineEmits<{
  (e: 'playAll' | 'playSelected', shuffle: boolean): void
  (e: 'filter', keywords: string): void
  (e: 'clearQueue' | 'deletePlaylist' | 'refresh'): void
}>()

const SongListFilter = defineAsyncComponent(() => import('@/components/song/song-list/SongListFilter.vue'))

const config = toRef(props, 'config')

const [allPlayables] = requireInjection<[Ref<Playable[]>]>(PlayablesKey)
const [filteredPlayables] = requireInjection<[Ref<Playable[]>]>(FilteredPlayablesKey)
const [selectedPlayables] = requireInjection(SelectedPlayablesKey)

const addToButton = ref<InstanceType<typeof Btn>>()
const addToMenu = ref<HTMLDivElement>()
const showingAddToMenu = ref(false)
const altPressed = ref(false)

const showAddToButton = computed(() => Boolean(selectedPlayables.value.length))

const shuffle = () => emit('playAll', true)
const shuffleSelected = () => emit('playSelected', true)
const playAll = () => emit('playAll', false)
const playSelected = () => emit('playSelected', false)
const clearQueue = () => emit('clearQueue')
const deletePlaylist = () => emit('deletePlaylist')
const refresh = () => emit('refresh')
const filter = (keywords: string) => emit('filter', keywords)
const registerKeydown = (event: KeyboardEvent) => event.key === 'Alt' && (altPressed.value = true)
const registerKeyup = (event: KeyboardEvent) => event.key === 'Alt' && (altPressed.value = false)

let usedFloatingUi: ReturnType<typeof useFloatingUi>

watch(showAddToButton, async showingButton => {
  await nextTick()

  if (showingButton) {
    usedFloatingUi = useFloatingUi(addToButton.value!.button!, addToMenu, { autoTrigger: false })
    usedFloatingUi.setup()
  } else {
    usedFloatingUi?.teardown()
  }
}, { immediate: true })

const closeAddToMenu = () => {
  usedFloatingUi?.hide()
  showingAddToMenu.value = false
}

const toggleAddToMenu = () => {
  showingAddToMenu.value ? usedFloatingUi?.hide() : usedFloatingUi?.show()
  showingAddToMenu.value = !showingAddToMenu.value
}

onMounted(() => {
  window.addEventListener('keydown', registerKeydown)
  window.addEventListener('keyup', registerKeyup)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', registerKeydown)
  window.removeEventListener('keyup', registerKeyup)

  usedFloatingUi?.teardown()
})
</script>
