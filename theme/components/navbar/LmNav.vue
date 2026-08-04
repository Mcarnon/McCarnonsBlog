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
    <div class="px-4 py-2 flex gap-3 w-full items-center sm:px-5">
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
        class="lm-nav-desktop-hamburger hidden md:inline-flex"
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
  @apply text-sm font-700 text-[var(--lm-c-text-primary)] no-underline transition-colors duration-200 hover:text-[var(--lm-c-brand)] inline-flex items-center gap-1.5;
}

.lm-nav-home__icon {
  @apply inline-block text-base opacity-80;
}

.lm-nav-desktop-hamburger {
  @apply inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--lm-c-border)] bg-[var(--lm-c-bg-glass)] text-[var(--lm-c-text-primary)] transition-[border-color,background-color,transform] duration-220 ease-out hover:border-[var(--lm-c-brand)] hover:-translate-y-0.25;
}

.lm-nav-desktop-hamburger-lines {
  @apply flex flex-col items-center justify-center gap-[3px];
}

.lm-nav-desktop-hamburger-line {
  @apply block h-[1.75px] origin-center rounded-full bg-[var(--lm-c-text-primary)] transition-all duration-250 ease-in-out;
}
</style>
