<template>
  <article class="flex-1 flex flex-col items-center justify-around  w-screen ">
    <img
      :src="coverArt"
      class="my-0 mx-auto w-[calc(70vw_+_4px)] pc:w-[calc(300px)] aspect-square rounded-full border-2 border-solid border-k-text-primary object-center object-cover"
      alt="Cover art"
    >
    <div class="w-full flex flex-col justify-around px-6">
      <div>
        <p class="text-[6vmin] pc:text-[3vmin] font-bold mx-auto mb-4">{{ playable.title }}</p>
        <p class="text-[5vmin] pc:text-[2vmin] mb-2 opacity-50">{{ artist }}</p>
        <p class="text-[4vmin] pc:text-[1vmin] opacity-50">{{ album }}</p>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import defaultCover from '@/../img/covers/default.svg'
import { getPlayableProp } from '@/utils/helpers'

const props = defineProps<{ playable: Playable }>()
const { playable } = toRefs(props)

const coverArt = computed(() => getPlayableProp<string>(playable.value, 'album_cover', 'episode_image') || defaultCover)

const artist = computed(() => getPlayableProp(playable.value, 'artist_name', 'podcast_author'))
const album = computed(() => getPlayableProp(playable.value, 'album_name', 'podcast_title'))
</script>

<style lang="postcss" scoped>
p {
  @apply max-w-[90%] mx-auto overflow-hidden text-ellipsis whitespace-nowrap leading-[1.3];
}
</style>
