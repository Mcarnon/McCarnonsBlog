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

/**
 * 导航触发后的短暂交互反馈窗口，避免抽屉在点击后立即离场。
 */
const ACTIVE_PREVIEW_DURATION = 80

/**
 * 抽屉收起动画时长，延迟跳转以免导航打断离场过渡。
 */
const NAV_CLOSE_DURATION = 280

let previewTimer: BrowserTimeout | undefined
let commitTimer: BrowserTimeout | undefined
let pendingNavigation: (() => void) | undefined
let navigationGeneration = 0
let navigationCloseGeneration: number | undefined

/**
 * 幂等取消尚未完成的导航任务，并使已进入回调队列的旧任务失效。
 */
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

/** 用户主动关闭抽屉，并取消所有尚未提交的导航。 */
function closeDrawerByUser() {
  cancelPendingNavigation()
  emit('close')
}

/**
 * 由当前导航流程请求关闭抽屉，使对应的 open=false 不会取消自身提交。
 *
 * @param expectedGeneration - 拥有本次关闭请求的导航代际。
 */
function closeDrawerByNavigation(expectedGeneration: number) {
  if (expectedGeneration !== navigationGeneration || !pendingNavigation)
    return

  navigationCloseGeneration = expectedGeneration
  emit('close')
}

/**
 * 执行仍属于当前代际的导航，并确保同一点击最多提交一次。
 *
 * @param expectedGeneration - 点击导航项时捕获的导航代际。
 */
function commitPendingNavigation(expectedGeneration: number) {
  if (expectedGeneration !== navigationGeneration || !pendingNavigation)
    return

  const navigate = pendingNavigation
  pendingNavigation = undefined
  navigationCloseGeneration = undefined
  navigate()
}

/** 减少动态效果启用后，立即关闭抽屉并提交尚在等待的导航。 */
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

/**
 * 保留短暂交互反馈，关闭抽屉后按链接类型完成最后一次请求的导航。
 *
 * @param item - 用户点击的导航项。
 */
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
/**
 * 同步处理抽屉开关变化：导航自身关闭时保留提交，重新打开时撤销旧导航。
 */
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
    if (desktop && open)
      closeDrawerByUser()
  },
  { immediate: true },
)
onBeforeUnmount(cancelPendingNavigation)

/**
 * 在抽屉进入过渡前将高度归零。
 *
 * @param el - 执行过渡的抽屉元素。
 */
function beforeEnter(el: Element) {
  (el as HTMLElement).style.height = '0px'
}

/**
 * 将抽屉高度过渡到真实内容高度。
 *
 * @param el - 执行过渡的抽屉元素。
 */
function enter(el: Element) {
  const node = el as HTMLElement
  // 使用真实内容高度做展开，而不是写死 max-height，
  // 这样导航项数量变化时不需要同步改动画参数。
  node.style.height = `${node.scrollHeight}px`
}

/**
 * 在抽屉进入过渡结束后恢复自适应高度。
 *
 * @param el - 完成进入过渡的抽屉元素。
 */
function afterEnter(el: Element) {
  (el as HTMLElement).style.height = 'auto'
}

/**
 * 在抽屉离开前固定当前内容高度，建立收起过渡起点。
 *
 * @param el - 即将执行离开过渡的抽屉元素。
 */
function beforeLeave(el: Element) {
  const node = el as HTMLElement
  node.style.height = `${node.scrollHeight}px`
}

/**
 * 强制建立离开过渡起点后将抽屉高度收至零。
 *
 * @param el - 执行离开过渡的抽屉元素。
 */
function leave(el: Element) {
  const node = el as HTMLElement

  // 强制触发一次回流，确保浏览器接收到“当前高度 -> 0”的过渡起点。
  void node.offsetHeight
  node.style.height = '0px'
}
</script>

<template>
  <Transition
    name="lm-mobile-nav"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
  >
    <div
      v-if="props.open"
      ref="panelRef"
      class="lm-mobile-nav-panel w-full relative z-[var(--lm-z-drawer)] overflow-hidden md:hidden"
      role="dialog"
      aria-modal="true"
      :aria-label="t('button.mobileNav')"
      tabindex="-1"
    >
      <nav class="flex flex-col" :aria-label="t('button.mobileNav')">
        <LmMobileNavGroup
          v-for="item in props.items"
          :key="item.link"
          :item="item"
          @navigate="handleItemClick"
        />
      </nav>

      <button
        type="button"
        class="lm-mobile-nav-panel__close"
        :aria-label="t('button.closeMobileNav')"
        @click="closeDrawerByUser"
      >
        {{ t('button.closeMobileNav') }}
      </button>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use '../../styles/mixins/surface' as *;

.lm-mobile-nav-panel {
  @include lm-surface-panel;

  border-radius: 0;
  border-top: none;
  border-left: none;
  border-right: none;
  margin-top: -1px;
  transform-origin: top center;
  box-shadow: 0 18px 36px rgb(15 23 42 / 0.16);
}

.lm-mobile-nav-panel__close {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;

  &:focus-visible {
    @apply right-3 top-2 z-1 h-9 w-auto rounded-full px-3 text-sm;

    clip: auto;
    margin: 0;
    overflow: visible;
    background: var(--lm-c-bg-glass);
    color: var(--lm-c-text-primary);
    border: 1px solid var(--lm-c-brand);
  }
}

.lm-mobile-nav-enter-active,
.lm-mobile-nav-leave-active {
  overflow: hidden;
  transition: height 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (prefers-reduced-motion: reduce) {
  .lm-mobile-nav-enter-active,
  .lm-mobile-nav-leave-active {
    transition: none;
  }
}
</style>
