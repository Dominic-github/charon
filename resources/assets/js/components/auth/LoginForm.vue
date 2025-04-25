<template>
  <div class="flex items-center justify-center min-h-screen mx-4 flex-col gap-5">
    <form
      v-show="!showingForgotPasswordForm"
      :class="{ error: failed }"
      class="w-full sm:w-[302px] sm:border duration-500 p-7 rounded-xl border-transparent sm:bg-white/8 space-y-3"
      data-testid="login-form"
      @submit.prevent="login"
    >
      <div class="text-center mb-8">
        <img alt="Charon's logo" class="inline-block" src="@/../img/logo.svg" width="156">
      </div>

      <FormRow>
        <TextInput v-model="email" autofocus placeholder="Email Address" required type="email" />
      </FormRow>

      <FormRow>
        <PasswordField v-model="password" placeholder="Password" required />
      </FormRow>

      <FormRow>
        <Btn data-testid="submit" type="submit">Log In</Btn>
      </FormRow>

      <FormRow v-if="canResetPassword">
        <a class="text-right text-[.95rem] text-k-text-secondary" role="button" @click.prevent="showForgotPasswordForm">
          Forgot password?
        </a>
      </FormRow>

      <FormRow>
        <p class="register text-center">
          Don't have account?
          <a class="" style="font-weight: 500;" @click="goRegister">Create Account</a>
        </p>
      </FormRow>
    </form>

    <div v-if="ssoProviders.length" v-show="!showingForgotPasswordForm" class="flex gap-3 items-center">
      <GoogleLoginButton v-if="ssoProviders.includes('Google')" @error="onSSOError" @success="onSSOSuccess" />
    </div>

    <ForgotPasswordForm v-if="showingForgotPasswordForm" @cancel="showingForgotPasswordForm = false" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { authService } from '@/services/authService'
import { logger } from '@/utils/logger'
import { useMessageToaster } from '@/composables/useMessageToaster'
import { useErrorHandler } from '@/composables/useErrorHandler'

import Btn from '@/components/ui/form/Btn.vue'
import PasswordField from '@/components/ui/form/PasswordField.vue'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm.vue'
import GoogleLoginButton from '@/components/auth/sso/GoogleLoginButton.vue'
import TextInput from '@/components/ui/form/TextInput.vue'
import FormRow from '@/components/ui/form/FormRow.vue'
import { checkPassword } from '@/utils/auth'

const emit = defineEmits<{ (e: 'loggedin'): void, (e: 'toggleIsLogin'): void }>()

const { toastSuccess } = useMessageToaster()
const DEMO_ACCOUNT = {
  email: 'demo@charon.dev',
  password: 'demo',
}

const goRegister = () => {
  emit('toggleIsLogin')
}

const canResetPassword = window.MAILER_CONFIGURED && !window.IS_DEMO
const ssoProviders = window.SSO_PROVIDERS || []

const email = ref(window.IS_DEMO ? DEMO_ACCOUNT.email : '')
const password = ref(window.IS_DEMO ? DEMO_ACCOUNT.password : '')
const failed = ref(false)
const showingForgotPasswordForm = ref(false)

const showForgotPasswordForm = () => (showingForgotPasswordForm.value = true)

const login = async () => {
  try {
    const { isValid, message } = checkPassword(password.value)

    if (password.value !== 'admin') {
      if (!isValid) {
        useMessageToaster().toastError(message)
        failed.value = true
        window.setTimeout(() => (failed.value = false), 2000)
        return
      }
    }

    await authService.login(email.value, password.value)
    failed.value = false

    // Reset the password so that the next login will have this field empty.
    password.value = ''
    toastSuccess('Logged in successfully!')

    emit('loggedin')
  } catch (error: unknown) {
    useErrorHandler('dialog').handleHttpError(error)
    failed.value = true
    logger.error(error)
    window.setTimeout(() => (failed.value = false), 2000)
  }
}

const onSSOError = (error: any) => {
  logger.error('SSO error: ', error)
  useMessageToaster().toastError('Login failed. Please try again.')
}

const onSSOSuccess = (token: CompositeToken) => {
  authService.setTokensUsingCompositeToken(token)
  emit('loggedin')
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
