<script lang="ts" setup>
import type { NavItem } from '../../types'
import { useNavActive } from '../../features/navigation'

const props = defineProps<{
  items: NavItem[]
}>()

const { isActive, clearPending } = useNavActive()
</script>

<template>
  <div class="lm-nav-submenu" role="menu">
    <AppLink
      v-for="child in props.items"
      :key="child.link"
      class="lm-nav-submenu__item"
      :class="isActive(child.link)
        ? 'text-[var(--lm-c-brand)] bg-[color-mix(in_srgb,var(--lm-c-brand-soft)_42%,transparent)]'
        : 'text-[var(--lm-c-text-secondary)] hover:text-[var(--lm-c-brand)] hover:bg-[color-mix(in_srgb,var(--lm-c-brand-soft)_24%,transparent)]'"
      :to="child.link"
      :target="child.target"
      :aria-current="isActive(child.link) ? 'page' : undefined"
      role="menuitem"
      rel="noopener"
      @click="clearPending"
    >
      <LmNavLinkContent :item="child" />
    </AppLink>
  </div>
</template>

<style lang="scss" scoped>
@use '../../styles/mixins/surface' as *;

.lm-nav-submenu {
  @include lm-surface-modal;

  @apply invisible pointer-events-none absolute right-0 top-full z-[var(--lm-z-dropdown)] min-w-38 p-1 opacity-0 transition-[opacity,transform,visibility] duration-180 ease-out;

  border-radius: var(--lm-radius-sm);
  margin-top: 0.65rem;
  transform: translateY(0.15rem);
}

.lm-nav-submenu__item {
  @apply flex min-h-9 items-center px-3 py-2 text-sm no-underline transition-[color,background-color] duration-180 ease-out;

  border-radius: var(--lm-radius-xs);
}
</style>
