<script setup lang="ts">
import type { ResolvedLinkItem } from '../../features/link'

defineProps<{
  item: ResolvedLinkItem
  statusCheck: boolean
}>()
</script>

<template>
  <a
    class="lm-link-card"
    :href="item.url"
    target="_blank"
    rel="noopener noreferrer"
    :style="{ '--lm-link-accent': item.color }"
  >
    <span class="lm-link-card__stripe" />

    <span class="lm-link-card__avatar-wrap">
      <img
        v-if="item.avatar"
        class="lm-link-card__avatar"
        :src="item.avatar"
        :alt="item.name"
        loading="lazy"
      >
      <span v-else class="lm-link-card__avatar lm-link-card__avatar--fallback">
        {{ item.initials }}
      </span>

      <LmLinkStatus
        :url="item.url"
        :enabled="statusCheck"
      />
    </span>

    <span class="lm-link-card__body">
      <span class="lm-link-card__name">{{ item.name }}</span>
      <span v-if="item.blog" class="lm-link-card__blog">{{ item.blog }}</span>
      <span class="lm-link-card__desc">{{ item.desc }}</span>
    </span>

    <span class="lm-link-card__arrow i-ri-arrow-right-up-line" />
  </a>
</template>

<style scoped lang="scss">
.lm-link-card {
  @apply relative grid grid-cols-[5.25rem_minmax(0,1fr)_auto] items-start gap-3.5 overflow-hidden rounded-3 border p-4 no-underline transition-[border-color,background-color,transform] duration-220 ease-out;
  color: var(--lm-c-text-primary);
  border-color: color-mix(in srgb, var(--lm-link-accent) 18%, var(--lm-c-border));
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--lm-link-accent) 8%, transparent), transparent 46%),
    color-mix(in srgb, var(--lm-surface-reading-bg) 72%, transparent);
}

.lm-link-card:hover,
.lm-link-card:focus-visible {
  border-color: color-mix(in srgb, var(--lm-link-accent) 42%, var(--lm-c-border));
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--lm-link-accent) 14%, transparent), transparent 52%),
    color-mix(in srgb, var(--lm-surface-reading-bg) 78%, transparent);
  outline: none;
  transform: translateY(-0.12rem);
}

.lm-link-card__stripe {
  @apply absolute left-0 top-0 h-full w-1;
  background: var(--lm-link-accent);
}

.lm-link-card__avatar-wrap {
  @apply relative mt-0.5 inline-flex h-20 w-20 items-center justify-center;
}

.lm-link-card__avatar {
  @apply h-20 w-20 rounded-full object-cover;
  border: 2px solid color-mix(in srgb, var(--lm-link-accent) 46%, white);
  box-shadow: 0 0 0 0.25rem color-mix(in srgb, var(--lm-link-accent) 12%, transparent);
}

.lm-link-card__avatar--fallback {
  @apply inline-flex items-center justify-center text-base font-900;
  color: var(--lm-c-text-primary);
  background: color-mix(in srgb, var(--lm-link-accent) 22%, transparent);
}

.lm-link-card__body {
  @apply flex min-w-0 flex-col pt-0.5;
}

.lm-link-card__name {
  @apply truncate text-base leading-6 font-900;
}

.lm-link-card__blog {
  @apply mt-0.5 truncate text-xs leading-5 font-700;
  color: color-mix(in srgb, var(--lm-link-accent) 72%, var(--lm-c-text-secondary));
}

.lm-link-card__desc {
  @apply mt-1.5 line-clamp-2 text-sm leading-6;
  color: var(--lm-c-text-secondary);
}

.lm-link-card__arrow {
  @apply mt-1 text-lg transition-transform duration-220 ease-out;
  color: var(--lm-c-text-muted);
}

.lm-link-card:hover .lm-link-card__arrow,
.lm-link-card:focus-visible .lm-link-card__arrow {
  transform: translate(0.1rem, -0.1rem);
  color: var(--lm-link-accent);
}

@media (max-width: 639px) {
  .lm-link-card {
    @apply grid-cols-[4.25rem_minmax(0,1fr)_auto] p-3.5;
  }

  .lm-link-card__avatar-wrap,
  .lm-link-card__avatar {
    @apply h-16 w-16;
  }
}
</style>
