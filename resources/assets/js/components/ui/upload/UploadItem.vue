<template>
  <div
    :class="cssClass"
    :title="file.message"
    class="upload-item relative rounded min-h-[32px] overflow-hidden bg-k-bg-secondary"
  >
    <span class="progress absolute h-full top-0 left-0 z-0 duration-200 ease-out bg-k-highlight" />
    <span class="details z-10 absolute h-full w-full flex items-center content-between">
      <span class="name px-4 flex-1">{{ file.name }}</span>
      <span class="flex items-center">
        <span v-if="file.status === 'Errored'" v-charon-tooltip.left :title="file.message" class="info !px-3">
          <Icon :icon="faInfoCircle" :title="file.message" />
        </span>
        <Btn v-if="canDone" class="!px-3" icon-only title="Done" transparent unrounded @click.prevent="done">
          <Icon :icon="faCheck" />
        </Btn>
        <Btn v-if="canEdit" class="!px-3" icon-only title="Edit" transparent unrounded @click.prevent="() => file.song && eventBus.emit('MODAL_SHOW_EDIT_SONG_FORM', file.song, 'details')">
          <Icon :icon="faPen" />
        </Btn>
        <Btn v-if="canRetry" class="!px-3" icon-only title="Retry" transparent unrounded @click="retry">
          <Icon :icon="faRotateBack" />
        </Btn>
        <Btn v-if="canRemove" class="!px-3" icon-only title="Remove" transparent unrounded @click="remove">
          <Icon :icon="faTrashCan" />
        </Btn>
      </span>
    </span>
  </div>
</template>

<script lang="ts" setup>
import slugify from 'slugify'
import { faCheck, faInfoCircle, faPen, faRotateBack, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { computed, defineAsyncComponent, toRefs } from 'vue'
import type { UploadFile } from '@/services/uploadService'
import { uploadService } from '@/services/uploadService'
import { eventBus } from '@/utils/eventBus'

const props = defineProps<{ file: UploadFile }>()

const Btn = defineAsyncComponent(() => import('@/components/ui/form/Btn.vue'))

const { file } = toRefs(props)

const canRetry = computed(() => file.value.status === 'Canceled' || file.value.status === 'Errored')
const canRemove = computed(() => file.value.status === 'Errored')
const canDone = computed(() => file.value.status === 'Uploaded' && file.value.id)
const canEdit = computed(() => file.value.status === 'Uploaded' && file.value.id)
const cssClass = computed(() => slugify(file.value.status).toLowerCase())
const progressBarWidth = computed(() => file.value.status === 'Uploading' ? `${file.value.progress}%` : '0')

const done = () => uploadService.removeFile(file.value)
const remove = () => uploadService.remove(file.value)
const retry = () => uploadService.retry(file.value)
</script>

<style lang="postcss" scoped>
.progress {
  width: v-bind(progressBarWidth);
}

.uploaded {
  @apply bg-k-success;
}

.errored {
  @apply bg-k-danger;
}
</style>
