<script lang="ts" setup>
import { useAppStore } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNavbarTools } from '../../features/navigation'
import { useThemeConfig } from '../../shared/config'

const props = defineProps<{
  drawerOpen: boolean
}>()

const emit = defineEmits<{
  toggleMobileDrawer: []
  openSearch: []
}>()

const appStore = useAppStore()
const themeConfig = useThemeConfig()
const { t } = useI18n()
const { showSearch, showDarkToggle } = useNavbarTools()

const darkToggleIcon = computed(() => {
  const toggleDarkBtn = themeConfig.value.ui?.toggleDarkBtn
  return appStore.isDark
    ? (toggleDarkBtn?.darkIcon || 'i-ri-moon-line')
    : (toggleDarkBtn?.lightIcon || 'i-ri-sun-line')
})

const hamburgerLines = computed(() => {
  if (themeConfig.value.navbarOptions?.hamburgerStyle === 'classic')
    return ['w-4', 'w-4', 'w-4']

  return ['w-4', 'w-3', 'w-4']
})
</script>

<template>
  <div class="lm-nav-tools">
    <button
      v-if="showSearch"
      type="button"
      class="lm-nav-tools__button"
      :aria-label="t('button.openSearch')"
      @click="emit('openSearch')"
    >
      <div i-ri-search-line text-xl />
    </button>

    <button
      v-if="showDarkToggle"
      type="button"
      class="lm-nav-tools__button"
      :aria-label="t('button.toggleDark')"
      @click="appStore.toggleDarkWithTransition"
    >
      <div :class="darkToggleIcon" text-xl />
    </button>

    <button
      type="button"
      class="lm-nav-tools__menu-button"
      :aria-expanded="props.drawerOpen"
      :aria-label="t('button.toggleMenu')"
      @click="emit('toggleMobileDrawer')"
    >
      <span class="lm-nav-tools__menu-lines">
        <span
          v-for="(lineClass, index) in hamburgerLines"
          :key="index"
          class="lm-nav-tools__menu-line"
          :class="[
            lineClass,
            props.drawerOpen && index === 0 ? 'translate-y-[5px] rotate-45 w-4' : '',
            props.drawerOpen && index === 1 ? 'opacity-0' : '',
            props.drawerOpen && index === 2 ? '-translate-y-[5px] -rotate-45 w-4' : '',
          ]"
        />
      </span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.lm-nav-tools {
  @apply ml-auto flex items-center gap-2;
}

.lm-nav-tools__button {
  @apply inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--lm-c-text-primary)] transition-[color,transform] duration-220 ease-out hover:text-[var(--lm-c-brand)] hover:-translate-y-0.25;
}

.lm-nav-tools__menu-button {
  @apply inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--lm-c-text-primary)] transition-[color,transform] duration-220 ease-out hover:text-[var(--lm-c-brand)] hover:-translate-y-0.25 md:hidden;
}

.lm-nav-tools__menu-lines {
  @apply flex flex-col items-center justify-center gap-[4px];
}

.lm-nav-tools__menu-line {
  @apply block h-[2px] origin-center rounded-full bg-[var(--lm-c-text-primary)] transition-all duration-250 ease-in-out;
}
</style>
