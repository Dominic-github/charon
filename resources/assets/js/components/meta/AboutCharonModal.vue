<template>
  <div
    v-charon-focus
    class="about text-k-text-secondary text-center max-w-[480px] overflow-hidden relative"
    data-testid="about-charon"
    tabindex="0"
    @keydown.esc="close"
  >
    <main class="p-6">
      <div class="mb-4">
        <img alt="Charon's logo" class="inline-block" src="@/../img/logo.svg" width="128">
      </div>

      <div class="current-version">
        Charon {{ currentVersion }}
      </div>

      <p v-if="shouldNotifyNewVersion" data-testid="new-version-about">
        <a :href="latestVersionReleaseUrl" target="_blank">
          A new version of Charon is available ({{ latestVersion }})!
        </a>
      </p>

      <p class="author">
        Made with ❤️ by
        <a href="https://github.com/dominic-github" rel="noopener" target="_blank">Dominic</a>
        and quite a few
        <a href="https://github.com/dominic-github/core/graphs/contributors" rel="noopener" target="_blank">awesome</a>&nbsp;<a
          href="https://github.com/dominic-github/charon/graphs/contributors" rel="noopener" target="_blank"
        >contributors</a>.
      </p>

      <p>
        Loving charon? Please consider supporting its development via
        <a href="https://github.com/users/dominic-github/sponsorship" rel="noopener" target="_blank">GitHub Sponsors.</a>
      </p>
    </main>

    <footer>
      <Btn danger data-testid="close-modal-btn" rounded @click.prevent="close">Close</Btn>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { useNewVersionNotification } from '@/composables/useNewVersionNotification'
import Btn from '@/components/ui/form/Btn.vue'

const emit = defineEmits<{ (e: 'close'): void }>()

const {
  shouldNotifyNewVersion,
  currentVersion,
  latestVersion,
  latestVersionReleaseUrl,
} = useNewVersionNotification()

const close = () => emit('close')
</script>

<style lang="postcss" scoped>
p {
  @apply mx-0 my-3;
}

a {
  @apply text-k-text-primary hover:text-k-accent;
}
</style>
