<script lang="ts" setup>
interface SocialLink {
  name: string
  link: string
  icon?: string
  color?: string
}

const props = defineProps<{
  items: SocialLink[]
}>()
</script>

<template>
  <div class="lm-hero-social-list">
    <AppLink
      v-for="item in props.items"
      :key="item.name"
      class="lm-hero-social-link"
      :to="item.link"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="item.name"
      :title="item.name"
      :style="{ '--lm-hero-social-color': item.color || 'var(--lm-c-brand)' }"
    >
      <div
        v-if="item.icon"
        :class="item.icon"
        class="text-lg"
      />
      <span class="sr-only">{{ item.name }}</span>
    </AppLink>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/mixins/surface' as *;

.lm-hero-social-list {
  @apply mt-1 flex flex-wrap gap-2;
  width: fit-content;
  row-gap: 0.55rem;
}

.lm-hero-social-link {
  @apply inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-250 ease-out;
  @include lm-surface-panel(
    color-mix(in srgb, var(--lm-c-bg-glass) 58%, transparent),
    color-mix(in srgb, var(--lm-c-border) 62%, transparent),
    0 8px 16px rgb(15 23 42 / 0.08),
    var(--lm-hero-surface-blur)
  );
  color: var(--lm-hero-social-color);
  opacity: 0.9;
  border-color: color-mix(in srgb, var(--lm-hero-social-color) 22%, transparent);
}

.lm-hero-social-link:hover,
.lm-hero-social-link:focus-visible {
  transform: translateY(-2px);
  opacity: 1;
  border-color: color-mix(in srgb, var(--lm-hero-social-color) 38%, transparent);
}

@media (prefers-reduced-motion: reduce) {
  .lm-hero-social-link {
    transition: none;
  }

  .lm-hero-social-link:hover,
  .lm-hero-social-link:focus-visible {
    transform: none;
  }
}
</style>
