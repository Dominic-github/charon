<template>
  <nav
    v-if="shown"
    ref="el"
    v-charon-focus
    :class="extraClass"
    :style="{ top, left, bottom, right }"
    class="menu context-menu select-none shadow"
    tabindex="0"
    @contextmenu.prevent
    @keydown.esc="close"
  >
    <ul>
      <slot>Menu items go here.</slot>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { nextTick, ref, toRefs } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { eventBus } from '@/utils/eventBus'
import { logger } from '@/utils/logger'

const props = defineProps<{ extraClass?: string }>()
const { extraClass } = toRefs(props)

const el = ref<HTMLElement>()
const shown = ref(false)
const top = ref('0')
const left = ref('0')
const bottom = ref('auto')
const right = ref('auto')

const preventOffScreen = async (element: HTMLElement, isSubmenu = false) => {
  const { bottom, right } = element.getBoundingClientRect()

  if (bottom > window.innerHeight) {
    element.style.top = 'auto'
    element.style.bottom = '0'
  } else {
    element.style.bottom = 'auto'
  }

  if (right > window.innerWidth) {
    element.style.right = isSubmenu ? `${el.value?.getBoundingClientRect().width}px` : '0'
    element.style.left = 'auto'
  } else {
    element.style.right = 'auto'
  }
}

const safeAreaHeight = ref('0px')
const safeAreaWidth = ref('0px')
const safeAreaClipPath = ref('0 0, 0 0, 0 0, 0 0')

type MenuItem = HTMLElement & {
  eventsRegistered?: boolean
}

const initSubmenus = () => {
  el.value?.querySelectorAll<HTMLElement>('.has-sub').forEach((item: MenuItem) => {
    const submenu = item.querySelector<HTMLElement>('.submenu')

    if (!submenu || item.eventsRegistered) {
      return
    }

    item.addEventListener('mouseenter', async () => {
      submenu.style.top = '0'
      submenu.style.left = '100%'
      submenu.style.bottom = 'auto'
      submenu.style.right = 'auto'
      submenu.style.display = 'block'

      await nextTick()
      await preventOffScreen(submenu, true)
    })

    item.addEventListener('mousemove', async (e: MouseEvent) => {
      await nextTick()
      const rect = submenu.getBoundingClientRect()
      safeAreaHeight.value = `${rect.height}px`
      safeAreaWidth.value = `${rect.x - e.clientX}px`
      safeAreaClipPath.value = `polygon(100% 0, 0 ${e.clientY - rect.top}px, 100% 100%)`
    })

    item.addEventListener('mouseleave', () => {
      submenu.style.top = '0'
      submenu.style.bottom = 'auto'
      submenu.style.display = 'none'
    })

    item.eventsRegistered = true
  })
}

const open = async (t = 0, l = 0) => {
  top.value = `${t}px`
  left.value = `${l}px`
  bottom.value = 'auto'
  right.value = 'auto'
  shown.value = true

  await nextTick()

  try {
    await preventOffScreen(el.value!)
    initSubmenus()
  } catch (error: unknown) {
    logger.error(error)
    // in a non-browser environment (e.g., unit testing), these two functions are broken due to calls to
    // getBoundingClientRect() and querySelectorAll()
  }

  eventBus.emit('CONTEXT_MENU_OPENED', el.value!)
}

const close = () => (shown.value = false)

onClickOutside(el, close)

// ensure there's only one context menu at any time
eventBus.on('CONTEXT_MENU_OPENED', target => target === el.value || close())

defineExpose({ open, close, shown })
</script>

<style lang="postcss" scoped>
nav {
  :deep(.has-sub) {
    @apply after:absolute after:right-0 after:top-0 after:z-[2] after:opacity-0;
  }

  :deep(.has-sub)::after {
    width: v-bind(safeAreaWidth);
    height: v-bind(safeAreaHeight);
    clip-path: v-bind(safeAreaClipPath);
  }
}
</style>
