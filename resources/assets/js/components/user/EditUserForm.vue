<template>
  <form data-testid="edit-user-form" :class="{ error: failed }" @submit.prevent="submit" @keydown.esc="maybeClose">
    <header>
      <h1>Edit User</h1>
    </header>

    <main class="space-y-5">
      <AlertBox v-if="user.sso_provider" type="info">
        This user logs in via SSO by {{ user.sso_provider }}.<br>
      </AlertBox>

      <FormRow>
        <template #label>Name</template>
        <TextInput v-model="updateData.name" v-charon-focus name="name" required title="Name" />
      </FormRow>
      <FormRow>
        <template #label>Email</template>
        <TextInput
          v-model="updateData.email"
          :readonly="user.sso_provider"
          name="email"
          required
          title="Email"
          type="email"
        />
      </FormRow>
      <FormRow v-if="!user.sso_provider">
        <template #label>Password</template>
        <TextInput
          v-model="updateData.password"
          autocomplete="new-password"
          name="password"
          placeholder="Leave blank for no changes"
          title="Password"
          type="password"
          minlength="10"
        />
        <template #help>Min. 10 characters. Should be a mix of characters, numbers, and symbols.</template>
      </FormRow>
      <FormRow>
        <div>
          <CheckBox v-model="updateData.is_admin" name="is_admin" />
          User is an admin
          <TooltipIcon title="Admins can perform administrative tasks like managing users and uploading songs." />
        </div>
      </FormRow>
    </main>

    <footer>
      <Btn class="btn-update" type="submit">Update</Btn>
      <Btn class="btn-cancel" white @click.prevent="maybeClose">Cancel</Btn>
    </footer>
  </form>
</template>

<script lang="ts" setup>
import { isEqual } from 'lodash'
import { reactive, ref, watch } from 'vue'
import type { UpdateUserData } from '@/stores/userStore'
import { userStore } from '@/stores/userStore'
import { useDialogBox } from '@/composables/useDialogBox'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useMessageToaster } from '@/composables/useMessageToaster'
import { useModal } from '@/composables/useModal'
import { useOverlay } from '@/composables/useOverlay'

import Btn from '@/components/ui/form/Btn.vue'
import TooltipIcon from '@/components/ui/TooltipIcon.vue'
import CheckBox from '@/components/ui/form/CheckBox.vue'
import AlertBox from '@/components/ui/AlertBox.vue'
import TextInput from '@/components/ui/form/TextInput.vue'
import FormRow from '@/components/ui/form/FormRow.vue'
import { checkPassword } from '@/utils/auth'

const emit = defineEmits<{ (e: 'close'): void }>()

const { showOverlay, hideOverlay } = useOverlay()
const { toastSuccess } = useMessageToaster()
const { showConfirmDialog, showErrorDialog } = useDialogBox()

const failed = ref(false)

const user = useModal().getFromContext<User>('user')

let originalData: UpdateUserData
let updateData: UpdateUserData

watch(user, () => {
  originalData = {
    name: user.name,
    email: user.email,
    is_admin: user.is_admin,
  }

  updateData = reactive(Object.assign({}, originalData))
}, { immediate: true })

const close = () => emit('close')

const submit = async () => {
  showOverlay()

  try {
    if (updateData.password) {
      const { isValid, message } = checkPassword(updateData.password)
      if (!isValid) {
        showErrorDialog(message)
        failed.value = true
        window.setTimeout(() => (failed.value = false), 2000)
        return
      }
    }

    await userStore.update(user, updateData)
    failed.value = false
    toastSuccess('User profile updated.')
    close()
  } catch (error: unknown) {
    failed.value = true
    showErrorDialog('Failed to update user profile.')
    window.setTimeout(() => (failed.value = false), 2000)
    useErrorHandler('dialog').handleHttpError(error)
  } finally {
    hideOverlay()
  }
}

const maybeClose = async () => {
  if (isEqual(originalData, updateData)) {
    close()
    return
  }

  await showConfirmDialog('Discard all changes?') && close()
}
</script>
