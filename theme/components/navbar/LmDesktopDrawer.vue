<script lang="ts" setup>
import type { BrowserTimeout } from '../../shared/browser'
import type { NavItem } from '../../types'
import { useMediaQuery } from '@vueuse/core'
import { onBeforeUnmount, ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { resolveInternalNavRoute, shouldOpenNavLinkWithWindow } from '../../features/navigation'
import { clearBrowserTimeout, getWindow, setBrowserTimeout, useModalFocusTrap, useReducedMotion } from '../../shared/browser'

const props = defineProps<{
  open: boolean
  items: NavItem[]
}>()

const emit = defineEmits<{
  close: []
  openSearch: []
}>()

const { t } = useI18n()
const router = useRouter()
const panelRef = ref<HTMLElement>()
const isDesktop = useMediaQuery('(min-width: 768px)')
const reducedMotion = useReducedMotion()

useModalFocusTrap({
  container: panelRef,
  lockBodyScroll: true,
  onClose: closeDrawerByUser,
  open: toRef(props, 'open'),
})

const ACTIVE_PREVIEW_DURATION = 80
const NAV_CLOSE_DURATION = 280

let previewTimer: BrowserTimeout | undefined
let commitTimer: BrowserTimeout | undefined
let pendingNavigation: (() => void) | undefined
let navigationGeneration = 0
let navigationCloseGeneration: number | undefined

function cancelPendingNavigation() {
  navigationCloseGeneration = undefined

  if (previewTimer === undefined && commitTimer === undefined && !pendingNavigation)
    return

  navigationGeneration += 1
  clearBrowserTimeout(previewTimer)
  clearBrowserTimeout(commitTimer)
  previewTimer = undefined
  commitTimer = undefined
  pendingNavigation = undefined
}

function closeDrawerByUser() {
  cancelPendingNavigation()
  emit('close')
}

function closeDrawerByNavigation(expectedGeneration: number) {
  if (expectedGeneration !== navigationGeneration || !pendingNavigation)
    return

  navigationCloseGeneration = expectedGeneration
  emit('close')
}

function commitPendingNavigation(expectedGeneration: number) {
  if (expectedGeneration !== navigationGeneration || !pendingNavigation)
    return

  const navigate = pendingNavigation
  pendingNavigation = undefined
  navigationCloseGeneration = undefined
  navigate()
}

function flushPendingNavigation() {
  if (!pendingNavigation)
    return

  const currentGeneration = navigationGeneration
  clearBrowserTimeout(previewTimer)
  clearBrowserTimeout(commitTimer)
  previewTimer = undefined
  commitTimer = undefined
  closeDrawerByNavigation(currentGeneration)
  commitPendingNavigation(currentGeneration)
}

function handleItemClick(item: NavItem) {
  cancelPendingNavigation()

  const currentWindow = getWindow()
  if (!currentWindow)
    return

  const currentGeneration = ++navigationGeneration
  pendingNavigation = () => {
    if (shouldOpenNavLinkWithWindow(item)) {
      currentWindow.open(item.link, item.target || '_blank', 'noopener')
      return
    }

    void router.push(resolveInternalNavRoute(item.link))
  }

  if (reducedMotion.value) {
    flushPendingNavigation()
    return
  }

  previewTimer = setBrowserTimeout(() => {
    previewTimer = undefined
    if (currentGeneration !== navigationGeneration)
      return

    closeDrawerByNavigation(currentGeneration)

    commitTimer = setBrowserTimeout(() => {
      commitTimer = undefined
      commitPendingNavigation(currentGeneration)
    }, NAV_CLOSE_DURATION)
  }, ACTIVE_PREVIEW_DURATION)
}

watch(() => router.currentRoute.value.fullPath, cancelPendingNavigation)
watch(reducedMotion, (reduced) => {
  if (reduced)
    flushPendingNavigation()
}, { flush: 'sync' })

watch(
  () => props.open,
  (open) => {
    if (open) {
      if (pendingNavigation)
        cancelPendingNavigation()

      return
    }

    if (navigationCloseGeneration === navigationGeneration) {
      navigationCloseGeneration = undefined
      return
    }

    cancelPendingNavigation()
  },
  { flush: 'sync' },
)
watch(
  [isDesktop, () => props.open],
  ([desktop, open]) => {
    if (!desktop && open)
      closeDrawerByUser()
  },
  { immediate: true },
)
onBeforeUnmount(cancelPendingNavigation)
</script>

<template>
  <Transition name="lm-desktop-drawer">
    <div
      v-if="props.open"
      ref="panelRef"
      class="lm-desktop-drawer-panel hidden md:block fixed top-0 bottom-0 left-0 w-72 z-[var(--lm-z-drawer)] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      :aria-label="t('button.mobileNav')"
      tabindex="-1"
    >
      <div class="lm-desktop-drawer-header">
        <button
          type="button"
          class="lm-desktop-drawer-close"
          :aria-label="t('button.closeMobileNav')"
          @click="closeDrawerByUser"
        >
          <span class="i-ri-close-line text-lg" aria-hidden="true" />
        </button>
      </div>

      <nav class="flex flex-col" :aria-label="t('button.mobileNav')">
        <LmMobileNavGroup
          v-for="item in props.items"
          :key="item.link"
          :item="item"
          @navigate="handleItemClick"
        />
      </nav>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use '../../styles/mixins/surface' as *;

.lm-desktop-drawer-panel {
  @include lm-surface-modal;

  border-radius: 0;
  border-top: none;
  border-left: none;
  border-bottom: none;
  padding-top: 5rem;
}

.lm-desktop-drawer-header {
  @apply absolute top-0 right-0 p-3 flex justify-end;
}

.lm-desktop-drawer-close {
  @apply inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--lm-c-border)] bg-[var(--lm-c-bg-glass)] text-[var(--lm-c-text-primary)] transition-[border-color,background-color,transform] duration-220 ease-out hover:border-[var(--lm-c-brand)] hover:-translate-y-0.25;
}

.lm-desktop-drawer-enter-active,
.lm-desktop-drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.lm-desktop-drawer-enter-from,
.lm-desktop-drawer-leave-to {
  transform: translateX(-100%);
}

@media (prefers-reduced-motion: reduce) {
  .lm-desktop-drawer-enter-active,
  .lm-desktop-drawer-leave-active {
    transition: none;
  }
}
</style>
