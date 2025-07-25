<template>
  <article
    :class="{ me: isCurrentUser }"
    class="apply p-4 flex items-center rounded-md bg-k-bg-secondary border border-k-border
    gap-3 transition-[border-color] duration-200 ease-in-out hover:border-white/15"
    data-testid="user-card"
  >
    <UserAvatar :user="user" width="48" />

    <main class="flex flex-col justify-between relative flex-1 gap-1">
      <h3 class="font-medium flex gap-2 items-center">
        <span v-if="user.name" class="name">{{ user.name }}</span>
        <span v-else class="name font-light text-k-text-secondary">Anonymous</span>
        <Icon v-if="isCurrentUser" :icon="faCircleCheck" class="you text-k-highlight" title="This is you!" />
        <Icon
          v-if="user.is_admin"
          :icon="faShield"
          class="is-admin text-k-primary"
          title="User has admin privileges"
        />
        <img
          v-if="user.sso_provider === 'Google'"
          :src="googleLogo"
          alt="Google"
          height="14"
          title="Google SSO"
          width="14"
        >
      </h3>

      <p class="text-k-text-secondary">{{ user.email }}</p>
    </main>

    <div class="space-x-2">
      <template v-if="user.is_prospect">
        <Btn class="revoke-user-btn" danger small @click="revokeInvite">Revoke</Btn>
      </template>
      <template v-else>
        <Btn class="edit-user-btn" v-if="!user.is_prospect" highlight small @click="edit">
          {{ isCurrentUser ? 'Your Profile' : 'Edit' }}
        </Btn>
        <Btn class="delete-user-btn" v-if="!isCurrentUser" danger small @click="destroy">Delete</Btn>
      </template>
    </div>
  </article>
</template>

<script lang="ts" setup>
import googleLogo from '@/../img/logos/google.svg'
import { faCircleCheck, faShield } from '@fortawesome/free-solid-svg-icons'
import { computed, toRefs } from 'vue'
import { userStore } from '@/stores/userStore'
import { invitationService } from '@/services/invitationService'
import { eventBus } from '@/utils/eventBus'
import { useRouter } from '@/composables/useRouter'
import { useAuthorization } from '@/composables/useAuthorization'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useMessageToaster } from '@/composables/useMessageToaster'
import { useDialogBox } from '@/composables/useDialogBox'

import Btn from '@/components/ui/form/Btn.vue'
import UserAvatar from '@/components/user/UserAvatar.vue'

const props = defineProps<{ user: User }>()
const { user } = toRefs(props)

const { toastSuccess } = useMessageToaster()
const { showConfirmDialog } = useDialogBox()
const { go, url } = useRouter()

const { currentUser } = useAuthorization()

const isCurrentUser = computed(() => user.value.id === currentUser.value.id)

const edit = () => isCurrentUser.value ? go(url('profile')) : eventBus.emit('MODAL_SHOW_EDIT_USER_FORM', user.value)

const destroy = async () => {
  if (!await showConfirmDialog(`Unperson ${user.value.name}?`)) {
    return
  }

  await userStore.destroy(user.value)
  toastSuccess(`User "${user.value.name}" deleted.`)
}

const revokeInvite = async () => {
  if (!await showConfirmDialog(`Revoke the invite for ${user.value.email}?`)) {
    return
  }

  try {
    await invitationService.revoke(user.value)
    toastSuccess(`Invitation for ${user.value.email} revoked.`)
  } catch (error: unknown) {
    useErrorHandler('dialog').handleHttpError(error, {
      404: 'Cannot revoke the invite. Maybe it has been accepted?',
    })
  }
}
</script>
