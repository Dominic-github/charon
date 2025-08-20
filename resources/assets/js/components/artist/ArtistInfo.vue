<template>
  <AlbumArtistInfo :mode="mode" data-testid="artist-info">
    <template #header>{{ artist.name }}</template>

    <template #art>
      <ArtistThumbnail :entity="artist" data-testid="artist-thumbnail" />
    </template>

    <template v-if="info?.bio">
      <ExpandableContentBlock v-if="mode === 'aside'">
        <div v-html="info.bio.full" />
      </ExpandableContentBlock>

      <div v-else v-html="info.bio.full" />
    </template>

    <template v-if="info" #footer>
      Data &copy;
      <a :href="info.url" rel="openener" target="_blank">Last.fm</a>
    </template>
  </AlbumArtistInfo>
</template>

<script lang="ts" setup>
import { ref, toRefs, watch } from 'vue'
import { encyclopediaService } from '@/services/encyclopediaService'
import { useThirdPartyServices } from '@/composables/useThirdPartyServices'

import ArtistThumbnail from '@/components/ui/album-artist/AlbumOrArtistThumbnail.vue'
import AlbumArtistInfo from '@/components/ui/album-artist/AlbumOrArtistInfo.vue'
import ExpandableContentBlock from '@/components/ui/album-artist/ExpandableContentBlock.vue'

const props = withDefaults(defineProps<{ artist: Artist, mode?: EncyclopediaDisplayMode }>(), { mode: 'aside' })
const { artist, mode } = toRefs(props)

const { useLastfm, useSpotify } = useThirdPartyServices()

const info = ref<ArtistInfo | null>(null)

watch(artist, async () => {
  info.value = null

  if (useLastfm.value || useSpotify.value) {
    info.value = await encyclopediaService.fetchForArtist(artist.value)
  }
}, { immediate: true })
</script>
