<template>
  <div class="flex items-center justify-center h-screen">
    <form
      v-if="validPayload && validLink"
      :class="{ error: failed }"
      class="flex flex-col gap-3 sm:w-[480px] sm:bg-white/10 sm:rounded-lg p-7"
      @submit.prevent="submit"
    >
      <h1 class="text-2xl mb-2">Set New Password</h1>
      <label>
        <PasswordField v-model="password" minlength="10" placeholder="New password" required />
        <span class="help block mt-4">Min. 10 characters. Should be a mix of characters, numbers, and symbols.</span>
      </label>
      <div>
        <Btn :disabled="loading" type="submit">Save</Btn>
      </div>
    </form>
    <div v-else class="flex items-center justify-center h-screen flex-col gap-3">
      <p>Invalid or expired reset password link.</p>
      <a href="/home" @click.prevent="goToHomeAndReload">Go home</a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { authService } from '@/services/authService'
import { base64Decode } from '@/utils/crypto'
import { logger } from '@/utils/logger'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useMessageToaster } from '@/composables/useMessageToaster'
import { useRouter } from '@/composables/useRouter'

import PasswordField from '@/components/ui/form/PasswordField.vue'
import Btn from '@/components/ui/form/Btn.vue'
import { checkPassword } from '@/utils/auth'

const { getRouteParam, go } = useRouter()
const { toastSuccess, toastError } = useMessageToaster()

const failed = ref(false)

const email = ref('')
const token = ref('')
const password = ref('')
const loading = ref(false)
const validLink = ref(true)
const validPayload = computed(() => email.value && token.value)

const goToHomeAndReload = () => {
  window.location.href = '#/home'
  window.location.reload()
}

try {
  [email.value, token.value] = base64Decode(decodeURIComponent(getRouteParam('payload')!)).split('|')
} catch (error: unknown) {
  logger.error(error)
  toastError('Invalid reset password link.')
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
    await authService.resetPassword(email.value, password.value, token.value)
    failed.value = false
    toastSuccess('Password set.')
    await authService.login(email.value, password.value)
    setTimeout(() => go('/', true))
  } catch (error: any) {
    failed.value = true
    if (error.response?.status === 422) {
      validLink.value = false
      toastError('Invalid reset password link.')
      return
    } else {
      toastError('Failed to set password. Please try again.')
    }
    useErrorHandler().handleHttpError(error)
    window.setTimeout(() => (failed.value = false), 2000)
  } finally {
    loading.value = false
  }
}
</script>
