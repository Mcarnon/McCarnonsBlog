<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useHomePaginationScrollBehavior } from '../../features/home'
import { useLayoutShell } from '../../features/navigation'

defineProps<{
  hideFooter?: boolean
}>()

const router = useRouter()
const { t } = useI18n()
const {
  closeDrawer,
  closeSearch,
  headerVisible,
  isDrawerOpen,
  isSearchOpen,
  navItems,
  openSearch,
  pageSurfaceStyle,
  showGlobalNotice,
  toggleDrawer,
} = useLayoutShell()

useHomePaginationScrollBehavior(router)
</script>

<template>
  <div class="min-h-screen antialiased relative isolate">
    <LmBackgroundLayer />

    <button
      v-if="isDrawerOpen"
      type="button"
      class="lm-mobile-drawer-backdrop"
      :aria-label="t('button.closeMobileNav')"
      @click="closeDrawer"
    />

    <div
      class="transition-transform duration-250 ease-in-out inset-x-0 top-0 fixed z-[var(--lm-z-navbar)]"
      :class="headerVisible ? 'translate-y-0' : '-translate-y-full'"
    >
      <div class="w-full">
        <LmNav
          :drawer-open="isDrawerOpen"
          :items="navItems"
          @toggle-mobile-drawer="toggleDrawer"
          @open-search="openSearch"
        />
        <LmMobileDrawer
          :open="isDrawerOpen"
          :items="navItems"
          @close="closeDrawer"
          @open-search="openSearch"
        />
      </div>
    </div>

    <LmSearchModal
      :open="isSearchOpen"
      @close="closeSearch"
    />

    <div class="lm-page-surface-layer" :style="pageSurfaceStyle" />

    <div v-if="showGlobalNotice" class="lm-global-notice">
      <LmNotice />
    </div>

    <main class="w-full relative z-[var(--lm-z-content)]">
      <slot />
    </main>

    <LmHelper />

    <div v-if="!hideFooter" class="relative z-[var(--lm-z-content)]">
      <LmFooter />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lm-mobile-drawer-backdrop {
  @apply fixed inset-0 z-[var(--lm-z-drawer-backdrop)] border-0 bg-transparent p-0 md:hidden;
}

.lm-global-notice {
  @apply relative z-[var(--lm-z-content)] mx-auto w-full max-w-6xl pt-12 px-4 sm:px-6 xl:px-0;
}

.lm-page-surface-layer {
  // 用文档流内的 absolute 定位代替“fixed + JS 追踪 Hero 底部”：
  // 边界直接锚在内容坐标上，滚动时自然跟随 Hero，
  // 既不需要监听滚动，也不会因为移动 fixed 元素而产生累计布局偏移（CLS）。
  // top 由内联样式提供（首页为 Hero 高度，其余页面为 0），SSR 阶段即已确定。
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: var(--lm-z-page-surface);
  pointer-events: none;

  background: color-mix(in srgb, var(--lm-c-bg-glass) 62%, transparent);
  backdrop-filter: blur(6px) saturate(1.04);
}
</style>
