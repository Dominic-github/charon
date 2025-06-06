<template>
  <div class="flex items-center justify-center h-screen flex-col">
    <form
      v-if="userProspect"
      :class="{ error: failed }"
      autocomplete="off"
      class="w-full sm:w-[320px] p-7 sm:bg-white/10 rounded-lg flex flex-col space-y-5"
      @submit.prevent="submit"
    >
      <header class="mb-4">
        Welcome to Charon! To accept the invitation, fill in the form below and click that button.
      </header>

      <FormRow>
        <template #label>Your email</template>
        <TextInput v-model="userProspect.email" disabled />
      </FormRow>

      <FormRow>
        <template #label>Your name</template>
        <TextInput
          v-model="name"
          v-charon-focus
          data-testid="name"
          placeholder="Erm… Bruce Dickinson?"
          required
        />
      </FormRow>

      <FormRow>
        <template #label>Password</template>
        <PasswordField v-model="password" data-testid="password" required />
        <template #help>Min. 10 characters. Should be a mix of characters, numbers, and symbols.</template>
      </FormRow>

      <FormRow>
        <Btn :disabled="loading" data-testid="submit" type="submit">Accept &amp; Log In</Btn>
      </FormRow>
    </form>

    <div v-if="!validToken" class="flex items-center justify-center h-screen flex-col gap-3">
      <h1>Invalid or expired invite.</h1>
      <a href=" /home" @click.prevent="goToHomeAndReload">Go home</a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { invitationService } from '@/services/invitationService'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useRouter } from '@/composables/useRouter'

import Btn from '@/components/ui/form/Btn.vue'
import PasswordField from '@/components/ui/form/PasswordField.vue'
import TextInput from '@/components/ui/form/TextInput.vue'
import FormRow from '@/components/ui/form/FormRow.vue'
import { useMessageToaster } from '@/composables/useMessageToaster'
import { checkPassword } from '@/utils/auth'

const { getRouteParam } = useRouter()
const { handleHttpError } = useErrorHandler('dialog')

const name = ref('')
const password = ref('')
const userProspect = ref<User>()
const validToken = ref(true)
const loading = ref(false)
const failed = ref(false)
const { toastSuccess, toastError } = useMessageToaster()

const token = String(getRouteParam('token')!)

const goToHomeAndReload = () => {
  window.location.href = '#/home'
  window.location.reload()
}

const submit = async () => {
  try {
    loading.value = true
    const { isValid, message } = checkPassword(password.value)
    if (!isValid) {
      toastError(message)
      failed.value = true
      window.setTimeout(() => (failed.value = false), 2000)
      return
    }
    await invitationService.accept(token, name.value, password.value)
    toastSuccess('Invitation accepted!')
    window.location.href = '/'
  } catch (error: unknown) {
    failed.value = true
    window.setTimeout(() => (failed.value = false), 2000)
    toastError('Failed to accept invitation.')
    handleHttpError(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    userProspect.value = await invitationService.getUserProspect(token)
  } catch (error: unknown) {
    handleHttpError(error, { 404: () => (validToken.value = false) })
  }
})
</script>
