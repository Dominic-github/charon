<template>
  <a
    v-if="currentUser"
    v-charon-tooltip.left
    class="view-profile rounded-full"
    data-testid="view-profile-link"
    :href="url('profile')"
    title="Profile and preferences"
  >
    <UserAvatar
      :user="currentUser"
      class="p-0.5 border border-solid border-white/10 transition duration-200 ease-in-out hover:border-white/30 active:scale-95"
      width="40"
    />
  </a>
</template>

<script lang="ts" setup>
import { useAuthorization } from '@/composables/useAuthorization'
import { useRouter } from '@/composables/useRouter'

import UserAvatar from '@/components/user/UserAvatar.vue'

const { url } = useRouter()
const { currentUser } = useAuthorization()
</script>
