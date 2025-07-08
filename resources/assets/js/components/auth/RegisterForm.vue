<template>
  <div v-if="!showAgreement" class="flex items-center justify-center min-h-screen mx-4 flex-col gap-5">
    <form
      :class="{ error: failed }"
      class="w-full sm:w-[302px] sm:border duration-500 p-7 rounded-xl border-transparent sm:bg-white/6 space-y-3 "
      data-testid="register-form"
      @submit.prevent="register"
    >
      <div class="text-center mb-8">
        <img alt="Charon's logo" class="inline-block" src="@/../img/logo.svg" width="156">
      </div>

      <FormRow>
        <TextInput v-model="fullName" data-testid="register-fullname" autofocus placeholder="Full Name" required type="text" />
      </FormRow>

      <FormRow>
        <TextInput v-model="email" data-testid="register-email" autofocus placeholder="Email Address" required type="email" />
      </FormRow>

      <FormRow>
        <PasswordField v-model="password" data-testid="register-password" placeholder="Password" required />
      </FormRow>

      <FormRow>
        <PasswordField v-model="rePassword" data-testid="register-confirm-password" placeholder="Confirm Password" required />
        <template #help>Min. 10 characters. Should be a mix of characters, numbers, and symbols.</template>
      </FormRow>
      <FormRow>
        <div>
          <CheckBox v-model="terms" data-testid="term-btn" name="terms" required />
          <label class="text-k-text-secondary">
            I have read and agree to <a @click="toggleAgreement">the terms of service</a>.
          </label>
        </div>
      </FormRow>

      <FormRow>
        <Btn data-testid="register-submit" type="submit">Create Account</Btn>
      </FormRow>

      <FormRow>
        <p class="register text-center">Already have an account? <a style="font-weight: 500;" @click="goLogin">Login</a></p>
      </FormRow>
    </form>
    <div v-if="ssoProviders.length" class="flex gap-3 items-center">
      <GoogleLoginButton v-if="ssoProviders.includes('Google')" @error="onSSOError" @success="onSSOSuccess" />
    </div>
  </div>
  <Agreement v-else @toggle-agreement="toggleAgreement" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { authService } from '@/services/authService'
import { logger } from '@/utils/logger'
import { useMessageToaster } from '@/composables/useMessageToaster'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { defineAsyncComponent as defineAsyncComponentWithLoadingState } from '@/utils/helpers'

import GoogleLoginButton from '@/components/auth/sso/GoogleLoginButton.vue'
import Btn from '@/components/ui/form/Btn.vue'
import PasswordField from '@/components/ui/form/PasswordField.vue'
import TextInput from '@/components/ui/form/TextInput.vue'
import CheckBox from '@/components/ui/form/CheckBox.vue'

import FormRow from '@/components/ui/form/FormRow.vue'
import { checkPassword } from '@/utils/auth'

const emit = defineEmits<{ (e: 'registeredin'): void, (e: 'loggedin'): void, (e: 'toggleIsLogin'): void }>()

const Agreement = defineAsyncComponentWithLoadingState(() => import('@/components/auth/Agreement.vue'))

const { toastSuccess, toastError } = useMessageToaster()

const DEFAULT = {
  fullName: '',
  email: '',
  password: '',
  rePassword: '',
}

const showAgreement = ref(false)
const fullName = ref(DEFAULT.fullName)
const email = ref(DEFAULT.email)
const password = ref(DEFAULT.password)
const rePassword = ref(DEFAULT.rePassword)
const failed = ref(false)
const terms = ref(false)

const ssoProviders = window.SSO_PROVIDERS || []

const goLogin = () => {
  emit('toggleIsLogin')
}

const toggleAgreement = () => {
  showAgreement.value = !showAgreement.value
}

const onSSOError = (error: any) => {
  logger.error('SSO error: ', error)
  useMessageToaster().toastError('Login failed. Please try again.')
}

const onSSOSuccess = (token: CompositeToken) => {
  authService.setTokensUsingCompositeToken(token)
  emit('loggedin')
}

const register = async () => {
  try {
    const { isValid, message } = checkPassword(password.value, rePassword.value)
    if (!isValid) {
      toastError(message)
      failed.value = true
      window.setTimeout(() => (failed.value = false), 2000)
      return
    }

    await authService.register(fullName.value, email.value, password.value, rePassword.value)
    failed.value = false
    // Reset the password so that the next login will have this field empty.
    password.value = ''
    rePassword.value = ''
    toastSuccess('Account created successfully!')
    emit('registeredin')
  } catch (error: unknown) {
    useErrorHandler('dialog').handleHttpError(error)
    failed.value = true
    toastError('Registration failed. Please try again.')
    logger.error(error)
    window.setTimeout(() => (failed.value = false), 2000)
  }
}
</script>

<style lang="postcss" scoped>
/**
 * I like to move it move it
 * I like to move it move it
 * I like to move it move it
 * You like to - move it!
 */
@keyframes shake {
  8%,
  41% {
    transform: translateX(-10px);
  }
  25%,
  58% {
    transform: translateX(10px);
  }
  75% {
    transform: translateX(-5px);
  }
  92% {
    transform: translateX(5px);
  }
  0%,
  100% {
    transform: translateX(0);
  }
}

form {
  background: rgba(255, 255, 255, 0.08);
  &.error {
    @apply border-red-500;
    animation: shake 0.5s;
  }
}
</style>
