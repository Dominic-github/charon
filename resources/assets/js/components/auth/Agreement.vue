<template>
  <div class="flex flex-col h-screen text-gray-100 max-w-6xl mx-auto">
    <div class="p-5">
      <button
        class="flex items-center gap-2 hover:text-[#ff7d2e] transition-colors"
        @click="goRegister"
      >
        <span class="text-xl font-bold">←</span>
        <span>Back</span>
      </button>
    </div>

    <div class="flex-1 overflow-hidden flex flex-col">
      <header class="text-center p-5">
        <h1 class="text-3xl font-bold text-white">TERMS OF SERVICE</h1>
        <p class="text-lg text-gray-300 mt-2">{{ data.appName }} Music Streaming Service </p>
        <p class="text-gray-400 italic mt-1">Last updated: {{ data.lastUpdated }}</p>
      </header>

      <main class="flex-1 overflow-y-auto p-5">
        <section
          v-for="(section, index) in data.sections"
          :key="index"
          class="mb-8 last:mb-0"
        >
          <h2 class="text-xl font-semibold text-[#ff7d2e] pb-1 mb-3">
            {{ index + 1 }}. {{ section.title }}
          </h2>
          <div class="prose text-gray-200">
            <div v-for="(item, i) in section.content" :key="i" class="list-disc pl-5 space-y-2">
              <h3 v-if="item.startsWith('*')" class="text-xl font-bold">{{ item.slice(1) }} </h3>
              <li v-else-if="item.startsWith('-')"> {{ item.slice(1) }}</li>
              <p v-else>{{ item }}</p>
              <br>
            </div>
          </div>
        </section>
      </main>

      <footer class="p-5 border-t border-[#ff7d2e] text-center text-gray-400 text-sm">
        <p>For any questions about these Terms, please contact {{ data.contactEmail }}</p>
      </footer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import data from './terms/terms'

const emit = defineEmits<{ (e: 'toggleAgreement'): void }>()

const goRegister = () => {
  emit('toggleAgreement')
}
</script>

<style>
</style>
