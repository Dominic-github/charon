<template>
  <ContextMenu id="playlist-context-menu" ref="base">
    <li @click="play">Play</li>
    <li @click="shuffle">Shuffle</li>
    <li @click="addToQueue">Add to Queue</li>
    <template v-if="canShowCollaboration">
      <li class="separator" />
      <li @click="showCollaborationModal">Collaborate…</li>
    </template>
    <template v-if="canEditPlaylist">
      <li class="separator" />
      <li @click="edit">Edit…</li>
      <li @click="destroy">Delete</li>
    </template>
  </ContextMenu>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { eventBus } from '@/utils/eventBus'
import { useRouter } from '@/composables/useRouter'
import { useContextMenu } from '@/composables/useContextMenu'
import { useMessageToaster } from '@/composables/useMessageToaster'
import { usePolicies } from '@/composables/usePolicies'
import { playbackService } from '@/services/playbackService'
import { queueStore } from '@/stores/queueStore'
import { songStore } from '@/stores/songStore'

const { base, ContextMenu, open, trigger } = useContextMenu()
const { go, url } = useRouter()
const { toastWarning, toastSuccess } = useMessageToaster()
const { currentUserCan } = usePolicies()

const playlist = ref<Playlist>()

const canEditPlaylist = computed(() => currentUserCan.editPlaylist(playlist.value!))
const canShowCollaboration = computed(() => !playlist.value?.is_smart)

const edit = () => trigger(() => eventBus.emit('MODAL_SHOW_EDIT_PLAYLIST_FORM', playlist.value!))
const destroy = () => trigger(() => eventBus.emit('PLAYLIST_DELETE', playlist.value!))

const play = () => trigger(async () => {
  const songs = await songStore.fetchForPlaylist(playlist.value!)

  if (songs.length) {
    playbackService.queueAndPlay(songs)
    go(url('queue'))
  } else {
    toastWarning('The playlist is empty.')
  }
})

const shuffle = () => trigger(async () => {
  const songs = await songStore.fetchForPlaylist(playlist.value!)

  if (songs.length) {
    playbackService.queueAndPlay(songs, true)
    go(url('queue'))
  } else {
    toastWarning('The playlist is empty.')
  }
})

const addToQueue = () => trigger(async () => {
  const songs = await songStore.fetchForPlaylist(playlist.value!)

  if (songs.length) {
    queueStore.queueAfterCurrent(songs)
    toastSuccess('Playlist added to queue.')
  } else {
    toastWarning('The playlist is empty.')
  }
})

const showCollaborationModal = () => trigger(() => eventBus.emit('MODAL_SHOW_PLAYLIST_COLLABORATION', playlist.value!))

eventBus.on('PLAYLIST_CONTEXT_MENU_REQUESTED', async ({ pageX, pageY }, _playlist) => {
  playlist.value = _playlist
  await open(pageY, pageX)
})
</script>
