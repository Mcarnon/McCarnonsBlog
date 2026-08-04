<script setup lang="ts">
import type { AboutSocialLink } from '../../features/about'

defineProps<{
  items: AboutSocialLink[]
}>()
</script>

<template>
  <div class="lm-about-socials">
    <AppLink
      v-for="item in items"
      :key="item.name"
      class="lm-about-socials__item"
      :to="item.link"
      target="_blank"
      rel="noopener noreferrer"
      :title="item.name"
      :aria-label="item.name"
      :style="{ '--lm-about-social-color': item.color || 'var(--lm-c-brand)' }"
    >
      <span
        v-if="item.icon"
        class="lm-about-socials__icon"
        :class="item.icon"
      />
      <span class="lm-about-socials__name">{{ item.name }}</span>
    </AppLink>
  </div>
</template>

<style scoped lang="scss">
.lm-about-socials {
  @apply mt-4 flex flex-wrap gap-2;
}

.lm-about-socials__item {
  @apply inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs leading-5 font-800 no-underline transition-[border-color,background-color,transform] duration-220 ease-out;
  color: color-mix(in srgb, var(--lm-about-social-color) 82%, var(--lm-c-text-primary));
  border-color: color-mix(in srgb, var(--lm-about-social-color) 24%, var(--lm-c-border));
  background: color-mix(in srgb, var(--lm-about-social-color) 8%, transparent);
}

.lm-about-socials__item:hover,
.lm-about-socials__item:focus-visible {
  border-color: color-mix(in srgb, var(--lm-about-social-color) 42%, var(--lm-c-border));
  background: color-mix(in srgb, var(--lm-about-social-color) 13%, transparent);
  outline: none;
  transform: translateY(-0.08rem);
}

.lm-about-socials__icon {
  @apply text-base;
}
</style>
