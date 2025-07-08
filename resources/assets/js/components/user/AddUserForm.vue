<template>
  <form :class="{ error: failed }" data-testid="add-user-form" class=" sm:border border-transparent" @submit.prevent="submit" @keydown.esc="maybeClose">
    <header>
      <h1>Add New User</h1>
    </header>

    <main class="space-y-5">
      <FormRow>
        <template #label>Name</template>
        <TextInput v-model="newUser.name" v-charon-focus name="name" required title="Name" />
      </FormRow>
      <FormRow>
        <template #label>Email</template>
        <TextInput v-model="newUser.email" name="email" required title="Email" type="email" />
      </FormRow>
      <FormRow>
        <template #label>Password</template>
        <TextInput
          v-model="newUser.password"
          minlength="10"
          autocomplete="new-password"
          name="password"
          required
          title="Password"
          type="password"
        />
        <template #help>Min. 10 characters. Should be a mix of characters, numbers, and symbols.</template>
      </FormRow>
      <FormRow>
        <div>
          <CheckBox v-model="newUser.is_admin" name="is_admin" />
          User is an admin
          <TooltipIcon title="Admins can perform administrative tasks like managing users and uploading songs." />
        </div>
      </FormRow>
    </main>

    <footer>
      <Btn class="btn-add" type="submit">Save</Btn>
      <Btn class="btn-cancel" white @click.prevent="maybeClose">Cancel</Btn>
    </footer>
  </form>
</template>

<script lang="ts" setup>
import { isEqual } from 'lodash'
import { reactive, ref } from 'vue'
import type { CreateUserData } from '@/stores/userStore'
import { userStore } from '@/stores/userStore'
import { useDialogBox } from '@/composables/useDialogBox'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useMessageToaster } from '@/composables/useMessageToaster'
import { useOverlay } from '@/composables/useOverlay'

import Btn from '@/components/ui/form/Btn.vue'

import TooltipIcon from '@/components/ui/TooltipIcon.vue'
import CheckBox from '@/components/ui/form/CheckBox.vue'
import TextInput from '@/components/ui/form/TextInput.vue'
import FormRow from '@/components/ui/form/FormRow.vue'

import { checkPassword } from '@/utils/auth'

const emit = defineEmits<{ (e: 'close'): void }>()
const { showOverlay, hideOverlay } = useOverlay()
const { toastSuccess } = useMessageToaster()
const { showConfirmDialog, showErrorDialog } = useDialogBox()

const failed = ref(false)

const emptyUserData: CreateUserData = {
  name: '',
  email: '',
  password: '',
  is_admin: false,
}

const newUser = reactive<CreateUserData>(Object.assign({}, emptyUserData))

const close = () => emit('close')

const submit = async () => {
  showOverlay()

  try {
    const { isValid, message } = checkPassword(newUser.password)
    if (!isValid) {
      showErrorDialog(message)
      failed.value = true
      window.setTimeout(() => (failed.value = false), 2000)
      return
    }

    await userStore.store(newUser)
    failed.value = false
    toastSuccess(`New user "${newUser.name}" created.`)
    close()
  } catch (error: any) {
    failed.value = true
    showErrorDialog(error.message)
    window.setTimeout(() => (failed.value = false), 2000)
    useErrorHandler('dialog').handleHttpError(error)
  } finally {
    hideOverlay()
  }
}

const maybeClose = async () => {
  if (isEqual(newUser, emptyUserData)) {
    close()
    return
  }

  await showConfirmDialog('Discard all changes?') && close()
}
</script>
