<template>
  <OnClickOutside @trigger="maybeClose">
    <form
      class="flex border rounded-md overflow-hidden border-solid border-white/10 focus-within:bg-black/10 focus-within:border-white/40"
      @submit.prevent
    >
      <Btn v-charon-tooltip title="Filter" transparent unrounded @click.prevent="toggleInput">
        <Icon :icon="faFilter" fixed-width />
      </Btn>
      <TextInput
        v-show="showingInput"
        ref="input"
        v-model="keywords"
        class="!text-k-text-primary !bg-transparent !rounded-none !pl-0 !h-[unset] placeholder:text-white/50 focus-visible:outline-0"
        placeholder="Keywords"
        type="search"
        @blur="maybeClose"
      />
    </form>
  </OnClickOutside>
</template>

<script lang="ts" setup>
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { OnClickOutside } from '@vueuse/components'
import { nextTick, ref, watch } from 'vue'

import Btn from '@/components/ui/form/Btn.vue'
import TextInput from '@/components/ui/form/TextInput.vue'

const emit = defineEmits<{ (event: 'change', value: string): void }>()

const showingInput = ref(false)
const input = ref<InstanceType<typeof TextInput>>()
const keywords = ref('')

watch(keywords, value => emit('change', value))

const toggleInput = () => {
  showingInput.value = !showingInput.value

  if (showingInput.value) {
    nextTick(() => {
      input.value?.el?.focus()
      input.value?.el?.select()
    })
  } else {
    input.value?.el?.blur()
    keywords.value = ''
  }
}

const maybeClose = () => {
  if (keywords.value.trim() !== '') {
    return
  }

  showingInput.value = false
  input.value?.el?.blur()
  keywords.value = ''
}
</script>
