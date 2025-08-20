<template>
  <ScreenBase id="albumListScreen">
    <template #header>
      <ScreenHeader layout="collapsed">
        Albums
        <template #controls>
          <ViewModeSwitch v-model="viewMode" />
        </template>
      </ScreenHeader>
    </template>

    <ScreenEmptyState v-if="libraryEmpty">
      <template #icon>
        <Icon :icon="faCompactDisc" />
      </template>
      No albums found.
      <span class="secondary block">
        {{ isAdmin ? 'Have you set up your library yet?' : 'Contact your administrator to set up your library.' }}
      </span>
    </ScreenEmptyState>

    <div v-else ref="gridContainer" v-charon-overflow-fade class="-m-6 overflow-auto">
      <AlbumGrid ref="grid" :view-mode="viewMode" data-testid="album-grid">
        <template v-if="showSkeletons">
          <AlbumCardSkeleton v-for="i in 10" :key="i" :layout="itemLayout" />
        </template>
        <template v-else>
          <AlbumCard v-for="album in albums" :key="album.id" data-testid="album-card" :album="album"
            :layout="itemLayout" :show-release-year="sortParams.field === 'year'" />
          <ToTopButton />
        </template>
      </AlbumGrid>
    </div>
  </ScreenBase>
</template>

<script lang="ts" setup>
import { faCompactDisc } from '@fortawesome/free-solid-svg-icons'
import { computed, reactive, ref, toRef, watch } from 'vue'
import { albumStore } from '@/stores/albumStore'
import { commonStore } from '@/stores/commonStore'
import { preferenceStore as preferences } from '@/stores/preferenceStore'
import { useRouter } from '@/composables/useRouter'
import { useErrorHandler } from '@/composables/useErrorHandler'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useAuthorization } from '@/composables/useAuthorization'

import AlbumCard from '@/components/album/AlbumCard.vue'
import AlbumCardSkeleton from '@/components/ui/skeletons/ArtistAlbumCardSkeleton.vue'
import ScreenHeader from '@/components/ui/ScreenHeader.vue'
import ViewModeSwitch from '@/components/ui/ViewModeSwitch.vue'
import ScreenEmptyState from '@/components/ui/ScreenEmptyState.vue'
import ScreenBase from '@/components/screens/ScreenBase.vue'
import AlbumGrid from '@/components/ui/album-artist/AlbumOrArtistGrid.vue'

const { isAdmin } = useAuthorization()

const gridContainer = ref<HTMLDivElement>()
const viewMode = ref<ArtistAlbumViewMode>('thumbnails')
const albums = toRef(albumStore.state, 'albums')

const sortParams = reactive<{ field: AlbumListSortField, order: SortOrder }>({
  field: 'name',
  order: 'asc',
})

let initialized = false
const loading = ref(false)
const page = ref<number | null>(1)

const libraryEmpty = computed(() => commonStore.state.song_length === 0)
const itemLayout = computed<ArtistAlbumCardLayout>(() => viewMode.value === 'thumbnails' ? 'full' : 'compact')
const moreAlbumsAvailable = computed(() => page.value !== null)
const showSkeletons = computed(() => loading.value && albums.value.length === 0)

const fetchAlbums = async () => {
  if (loading.value || !moreAlbumsAvailable.value) {
    return
  }

  loading.value = true
    page.value = await albumStore.paginate({
    page: page!.value || 1,
    sort: sortParams.field,
    order: sortParams.order,
  })
  loading.value = false
}

const { ToTopButton, makeScrollable } = useInfiniteScroll(gridContainer, async () => await fetchAlbums())

useRouter().onScreenActivated('Albums', async () => {
  if (libraryEmpty.value) {
    return
  }

  if (!initialized) {
    viewMode.value = preferences.albums_view_mode || 'thumbnails'
    initialized = true

    try {
      await makeScrollable()
    } catch (error: unknown) {
      initialized = false
      useErrorHandler().handleHttpError(error)
    }
  }
})

watch(viewMode, () => (preferences.albums_view_mode = viewMode.value))
</script>
