<template>
  <form
    class="min-w-full sm:min-w-[480px] sm:bg-white/10 p-7 rounded-xl"
    data-testid="forgot-password-form"
    @submit.prevent="requestResetPasswordLink"
  >
    <h1 class="text-2xl mb-4">Forgot Password</h1>

    <FormRow>
      <div class="flex flex-col gap-3 sm:flex-row sm:gap-0 sm:content-stretch">
        <TextInput
          v-model="email"
          data-testid="email-forget-input"
          class="flex-1 sm:rounded-l sm:rounded-r-none"
          placeholder="Your email address" required
          type="email"
        />
        <Btn data-testid="reset-password-btn" :disabled="loading" class="sm:rounded-l-none sm:rounded-r" type="submit">Reset Password</Btn>
        <Btn :disabled="loading" class="!text-k-text-secondary" transparent @click="cancel">Cancel</Btn>
      </div>
    </FormRow>
  </form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { authService } from '@/services/authService'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useMessageToaster } from '@/composables/useMessageToaster'

import Btn from '@/components/ui/form/Btn.vue'
import TextInput from '@/components/ui/form/TextInput.vue'
import FormRow from '@/components/ui/form/FormRow.vue'

const emit = defineEmits<{ (e: 'cancel'): void }>()
const { handleHttpError } = useErrorHandler()
const { toastSuccess } = useMessageToaster()

const email = ref('')
const loading = ref(false)

const cancel = () => {
  email.value = ''
  emit('cancel')
}

const requestResetPasswordLink = async () => {
  try {
    loading.value = true
    await authService.requestResetPasswordLink(email.value)
    toastSuccess('Password reset link sent. Please check your email.')
  } catch (error: unknown) {
    handleHttpError(error, { 404: 'No user with this email address found.' })
  } finally {
    loading.value = false
  }
}
</script>
