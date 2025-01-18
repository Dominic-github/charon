<template>
  <img
    :alt="`Avatar of ${user.name}`"
    :src="avatar"
    :title="user.name"
    class="object-cover rounded-full aspect-square bg-k-bg-primary"
    @error="avatar = defaultCover"
  >
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import defaultCover from '@/../img/covers/default.svg'

const props = defineProps<{ user: Pick<User, 'name' | 'avatar'> }>()
const { user } = toRefs(props)

const avatar = computed(() => user.value.avatar)
</script>
