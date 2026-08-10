<script lang="ts" setup>
import { computed } from 'vue'
import { useThemeConfig } from '../../shared/config'

const props = defineProps<{
  drawerOpen: boolean
  desktopDrawerOpen: boolean
}>()

const emit = defineEmits<{
  toggleMobileDrawer: []
  toggleDesktopDrawer: []
  openSearch: []
}>()

const themeConfig = useThemeConfig()
const homeItem = computed(() => themeConfig.value.navbar.find(item => item.link === '/'))
</script>

<template>
  <nav
    class="lm-nav flex flex-col w-full transition-transform duration-250 ease-in-out relative"
  >
    <!-- 移动端：品牌区 + 工具 -->
    <div class="px-4 py-3 flex gap-3 w-full items-center sm:px-5 md:hidden">
      <LmNavBrand />
      <LmNavTools
        :drawer-open="props.drawerOpen"
        @open-search="emit('openSearch')"
        @toggle-mobile-drawer="emit('toggleMobileDrawer')"
      />
    </div>

    <!-- 桌面端：首页文字 + 汉堡 + 工具 -->
    <div class="px-4 py-3 hidden md:flex gap-3 w-full items-center sm:px-5">
      <RouterLink
        to="/"
        class="lm-nav-home"
      >
        <span
          v-if="homeItem?.icon"
          class="lm-nav-home__icon"
          :class="homeItem.icon"
        />
        <span>{{ homeItem?.text }}</span>
      </RouterLink>

      <button
        type="button"
        class="lm-nav-desktop-hamburger"
        :aria-expanded="props.desktopDrawerOpen"
        aria-label="Toggle navigation menu"
        @click="emit('toggleDesktopDrawer')"
      >
        <span class="lm-nav-desktop-hamburger-lines">
          <span
            class="lm-nav-desktop-hamburger-line"
            :class="[props.desktopDrawerOpen ? 'translate-y-[5px] rotate-45 w-4' : 'w-4']"
          />
          <span
            class="lm-nav-desktop-hamburger-line"
            :class="[props.desktopDrawerOpen ? 'opacity-0' : 'w-4']"
          />
          <span
            class="lm-nav-desktop-hamburger-line"
            :class="[props.desktopDrawerOpen ? '-translate-y-[5px] -rotate-45 w-4' : 'w-4']"
          />
        </span>
      </button>

      <LmNavTools
        :drawer-open="props.drawerOpen"
        @open-search="emit('openSearch')"
        @toggle-mobile-drawer="emit('toggleMobileDrawer')"
      />
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@use '../../styles/mixins/surface' as *;

.lm-nav {
  @include lm-surface-nav;

  border-radius: 0;
  margin-top: 0;
  border-top: none;
  border-left: none;
  border-right: none;
}

.lm-nav-home {
  @apply text-base font-700 text-[var(--lm-c-text-primary)] no-underline transition-colors duration-200 hover:text-[var(--lm-c-brand)] inline-flex items-center gap-1.5;
}

.lm-nav-home__icon {
  @apply inline-block text-lg opacity-80;
}

.lm-nav-desktop-hamburger {
  @apply inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--lm-c-text-primary)] transition-[color,transform] duration-220 ease-out hover:text-[var(--lm-c-brand)] hover:-translate-y-0.25;
}

.lm-nav-desktop-hamburger-lines {
  @apply flex flex-col items-center justify-center gap-[4px];
}

.lm-nav-desktop-hamburger-line {
  @apply block h-[2px] w-4 origin-center rounded-full bg-[var(--lm-c-text-primary)] transition-all duration-250 ease-in-out;
}

.lm-nav-desktop-hamburger:hover .lm-nav-desktop-hamburger-line {
  background-color: var(--lm-c-brand);
}
</style>
