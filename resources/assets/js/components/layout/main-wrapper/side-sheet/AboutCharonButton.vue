<template>
  <SideSheetButton
    id="btn-about"
    v-charon-tooltip.left
    :title="shouldNotifyNewVersion ? 'New version available!' : 'About Charon'"
    @click.prevent="openAboutCharonModal"
  >
    <Icon :icon="faInfoCircle" />
    <span
      v-if="shouldNotifyNewVersion"
      class="absolute w-[10px] aspect-square right-px top-px rounded-full bg-k-highlight"
      data-testid="new-version-indicator"
    />
  </SideSheetButton>
</template>

<script lang="ts" setup>
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { eventBus } from '@/utils/eventBus'
import { useNewVersionNotification } from '@/composables/useNewVersionNotification'

import SideSheetButton from '@/components/layout/main-wrapper/side-sheet/SideSheetButton.vue'

const { shouldNotifyNewVersion } = useNewVersionNotification()

const openAboutCharonModal = () => eventBus.emit('MODAL_SHOW_ABOUT_CHARON')
</script>
