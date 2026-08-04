<script lang="ts" setup>
import type { NavItem } from '../../types'
import { shouldShowExternalNavIndicator } from '../../features/navigation'

const props = defineProps<{
  item: NavItem
}>()
</script>

<template>
  <span class="lm-nav-link-content">
    <span
      v-if="props.item.icon"
      class="lm-nav-link-content__icon"
      :class="props.item.icon"
    />
    <span class="lm-nav-link-content__text">{{ props.item.text }}</span>
    <span
      v-if="shouldShowExternalNavIndicator(props.item)"
      class="lm-nav-link-content__external i-ri-external-link-line"
      aria-hidden="true"
    />
    <slot />
  </span>
</template>

<style lang="scss" scoped>
.lm-nav-link-content {
  @apply inline-flex min-w-0 flex-1 items-center gap-2;
}

.lm-nav-link-content__icon {
  @apply inline-block text-[0.95em] opacity-80;
}

.lm-nav-link-content__text {
  @apply flex-1 whitespace-nowrap text-left;
}

.lm-nav-link-content__external {
  @apply text-[0.88em] opacity-60;
}
</style>
