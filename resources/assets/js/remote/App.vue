<template>
  <MessageToaster ref="toaster" />
  <div :class="{ standalone: inStandaloneMode }" class="h-screen flex items-center justify-center bg-k-bg-primary overflow-y-auto pc:pt-4 pc:pb-4">
    <template v-if="authenticated">
      <AlbumArtOverlay v-if="showAlbumArtOverlay" :album="(state.playable as Song).album_id" />
      <main class="h-screen pc:h-[90vh] pc:w-[500px] flex flex-col items-center justify-between text-center relative z-[1]">
        <template v-if="connected">
          <template v-if="state.playable">
            <PlayableDetails :playable="state.playable" />
            <RemoteFooter :playable="state.playable" />
          </template>
          <p v-else class="text-k-text-secondary">No song is playing.</p>
        </template>
        <Scanner v-else />
      </main>
    </template>

    <div v-else class="h-screen flex flex-col items-center justify-center">
      <div v-if="isLogin">
        <LoginForm @toggle-is-login="toggleIsLogin" @loggedin="onUserLoggedIn" />
      </div>
      <div v-else>
        <RegisterForm @toggle-is-login="toggleIsLogin" @loggedin="onUserLoggedIn" @registeredin="onUserRegisteredIn" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent as defineAsyncComponentWithLoadingState } from '@/utils/helpers'
import { computed, defineAsyncComponent, onMounted, provide, reactive, ref } from 'vue'
import { authService } from '@/services/authService'
import { socketService } from '@/services/socketService'
import { preferenceStore } from '@/stores/preferenceStore'
import { userStore } from '@/stores/userStore'
import { isSong } from '@/utils/typeGuards'
import { MessageToasterKey} from '@/symbols'
import { logger } from '@/utils/logger'
import type { RemoteState } from '@/remote/types'
import MessageToaster from '@/components/ui/message-toaster/MessageToaster.vue'

const PlayableDetails = defineAsyncComponent(() => import('@/remote/components/PlayableDetails.vue'))
const Scanner = defineAsyncComponent(() => import('@/remote/components/Scanner.vue'))
const RemoteFooter = defineAsyncComponent(() => import('@/remote/components/RemoteFooter.vue'))
const AlbumArtOverlay = defineAsyncComponent(() => import('@/components/ui/AlbumArtOverlay.vue'))
const LoginForm = defineAsyncComponentWithLoadingState(() => import('@/components/auth/LoginForm.vue'))
const RegisterForm = defineAsyncComponentWithLoadingState(() => import('@/components/auth/RegisterForm.vue'))

const toaster = ref<InstanceType<typeof MessageToaster>>()
const authenticated = ref(false)
const connected = ref(false)
const isLogin = ref(true)

const state = reactive<RemoteState>({
  playable: null,
  volume: 0,
})

provide('state', state)

const showAlbumArtOverlay = computed(() => {
  return preferenceStore.show_album_art_overlay
    && state.playable
    && isSong(state.playable)
})

const toggleIsLogin = () => {
  isLogin.value = !isLogin.value
}

const onUserRegisteredIn = async () => {
  isLogin.value = true
}

const inStandaloneMode = ref(
  (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches,
)

const init = async () => {
  try {
    userStore.init(await authService.getProfile())
    await socketService.init()

    socketService
      .listen('SOCKET_PLAYABLE', playable => (state.playable = playable))
      .listen('SOCKET_PLAYBACK_STOPPED', () => state.playable && (state.playable.playback_state = 'Stopped'))
      .listen('SOCKET_VOLUME_CHANGED', (volume: number) => state.volume = volume)
      .listen('SOCKET_STATUS', (data: { playable?: Playable, volume: number }) => {
        state.volume = data.volume || 0
        state.playable = data.playable || null
        connected.value = true
      })
  } catch (error: unknown) {
    logger.error(error)
    authenticated.value = false
  }
}

const onUserLoggedIn = async () => {
  authenticated.value = true
  await init()
}

onMounted(async () => {
  // The app has just been initialized, check if we can get the user data with an already existing token
  if (authService.hasApiToken()) {
    authenticated.value = true
    await init()
  }
})
provide(MessageToasterKey, toaster)

</script>

<style lang="postcss" scoped>
.standalone {
  @apply pt-[20px];

  :deep(.cover) {
    width: calc(80vw - 4px);
    height: calc(80vw - 4px);
  }
}
</style>
