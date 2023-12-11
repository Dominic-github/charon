<template>
  <section id="profileWrapper">
    <ScreenHeader>Profile &amp; Preferences</ScreenHeader>

    <div class="main-scroll-wrap">
      <ProfileForm />
      <ThemeList />
      <PreferencesForm />
      <LastfmIntegration />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { defineAsyncComponent} from 'vue'

const ScreenHeader = defineAsyncComponent(() => import('@/components/ui/ScreenHeader.vue'))
const ProfileForm = defineAsyncComponent(() => import('@/components/profile-preferences/ProfileForm.vue'))
const LastfmIntegration = defineAsyncComponent(() => import('@/components/profile-preferences/LastfmIntegration.vue'))
const PreferencesForm = defineAsyncComponent(() => import('@/components/profile-preferences/PreferencesForm.vue'))
const ThemeList = defineAsyncComponent(() => import('@/components/profile-preferences/ThemeList.vue'))

</script>

<style lang="scss">
#profileWrapper {
  .main-scroll-wrap > * + * {
    margin-top: 1.75rem;
    padding-top: 1.75rem;
    border-top: 1px solid var(--color-background-secondary);
  }

  .main-scroll-wrap h1 {
    font-size: 1.85rem;
    margin-bottom: 1.25rem;
  }
}
</style>
