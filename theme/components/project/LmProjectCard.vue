<script setup lang="ts">
import type { ResolvedProjectItem } from '../../features/project'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  item: ResolvedProjectItem
}>()

const { t } = useI18n()

const primaryAction = computed(() => props.item.actions[0])
const cardTag = computed(() => primaryAction.value ? 'a' : 'article')
const cardAttrs = computed(() => {
  if (!primaryAction.value)
    return {}

  return {
    href: primaryAction.value.url,
    rel: 'noopener noreferrer',
    target: '_blank',
  }
})

/** 项目动作类型对应的卡片按钮图标类名。 */
const actionIconMap: Record<ResolvedProjectItem['actions'][number]['type'], string> = {
  demo: 'i-ri-play-circle-line',
  docs: 'i-ri-book-open-line',
  repo: 'i-ri-github-line',
  visit: 'i-ri-external-link-line',
}
</script>

<template>
  <component
    :is="cardTag"
    class="lm-project-card"
    :class="{
      'lm-project-card--featured': props.item.featured,
      'lm-project-card--with-cover': props.item.cover,
    }"
    :style="{ '--lm-project-accent': props.item.color }"
    v-bind="cardAttrs"
  >
    <div v-if="props.item.cover" class="lm-project-card__media" aria-hidden="true">
      <img
        class="lm-project-card__media-image"
        :src="props.item.cover"
        :alt="props.item.name"
      >
    </div>
    <div v-if="props.item.cover" class="lm-project-card__media-layer" aria-hidden="true" />

    <div class="lm-project-card__inner">
      <div class="lm-project-card__topline">
        <span
          class="lm-project-card__icon"
          :class="{ 'lm-project-card__icon--image': props.item.iconImg }"
          aria-hidden="true"
        >
          <img
            v-if="props.item.iconImg"
            class="lm-project-card__icon-img"
            :src="props.item.iconImg"
            :alt="props.item.name"
          >
          <span v-else-if="props.item.icon" :class="props.item.icon" />
          <span v-else class="i-ri-apps-2-line" />
        </span>

        <span class="lm-project-card__status" :class="`lm-project-card__status--${props.item.status}`">
          {{ t(`pages.projects.status.${props.item.status}`) }}
        </span>
      </div>

      <div class="lm-project-card__body">
        <h3 class="lm-project-card__title">
          {{ props.item.name }}
        </h3>
        <p v-if="props.item.desc" class="lm-project-card__desc">
          {{ props.item.desc }}
        </p>
      </div>

      <div v-if="props.item.tags.length" class="lm-project-card__tags" aria-hidden="true">
        <span
          v-for="tag in props.item.tags"
          :key="tag"
          class="lm-project-card__tag"
        >
          {{ tag }}
        </span>
      </div>

      <div v-if="props.item.actions.length" class="lm-project-card__actions">
        <a
          v-for="action in props.item.actions"
          :key="`${action.type}-${action.url}`"
          class="lm-project-card__action"
          :href="action.url"
          target="_blank"
          rel="noopener noreferrer"
          @click.stop
        >
          <span :class="actionIconMap[action.type]" aria-hidden="true" />
          <span>{{ t(`pages.projects.actions.${action.type}`) }}</span>
        </a>
      </div>
    </div>
  </component>
</template>

<style scoped lang="scss">
.lm-project-card {
  @apply relative flex min-h-[13.5rem] overflow-hidden rounded-4 no-underline transition-[box-shadow,transform] duration-240 ease-out;
  --lm-project-accent: var(--lm-c-brand);
  color: var(--lm-c-text-primary);
  background: color-mix(in srgb, var(--lm-surface-reading-bg) 80%, transparent);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--lm-project-accent) 10%, var(--lm-c-border)),
    0 8px 20px rgb(15 23 42 / 0.06);
}

.lm-project-card:hover {
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--lm-project-accent) 18%, var(--lm-c-border-hover)),
    0 12px 26px rgb(15 23 42 / 0.1);
  transform: translateY(-0.14rem);
}

.lm-project-card--featured::before {
  content: '';
  @apply pointer-events-none absolute inset-x-4 top-0 z-[var(--lm-z-raised-high)] h-px;
  background: linear-gradient(90deg, transparent, var(--lm-project-accent), transparent);
}

.lm-project-card--with-cover {
  color: white;
  background: #0f172a;
  box-shadow: 0 10px 24px rgb(15 23 42 / 0.12);
}

.lm-project-card__media {
  @apply pointer-events-none absolute inset-0;
}

.lm-project-card__media-image {
  @apply h-full w-full object-cover transition-transform duration-300 ease-out;
  transform: scale(1.01);
}

.lm-project-card:hover .lm-project-card__media-image {
  transform: scale(1.045);
}

.lm-project-card__media-layer {
  @apply pointer-events-none absolute inset-0;
  background:
    linear-gradient(90deg, rgba(8, 13, 26, 0.46) 0%, rgba(8, 13, 26, 0.22) 58%, rgba(8, 13, 26, 0.08) 100%),
    linear-gradient(180deg, rgba(8, 13, 26, 0.02) 0%, rgba(8, 13, 26, 0.34) 100%);
}

.lm-project-card__inner {
  @apply relative z-[var(--lm-z-raised)] flex min-w-0 flex-1 flex-col gap-3.5 p-4.5;
}

.lm-project-card__topline {
  @apply flex items-center justify-between gap-3;
}

.lm-project-card__icon {
  @apply inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2 text-base;
  color: var(--lm-project-accent);
  background: color-mix(in srgb, var(--lm-project-accent) 9%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--lm-project-accent) 16%, transparent);
}

.lm-project-card--with-cover .lm-project-card__icon {
  color: white;
  background: rgb(255 255 255 / 0.12);
  box-shadow: none;
  backdrop-filter: blur(8px);
}

.lm-project-card__icon--image,
.lm-project-card--with-cover .lm-project-card__icon--image {
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.lm-project-card__icon-img {
  @apply h-full w-full rounded-2 object-cover;
}

.lm-project-card__status {
  @apply inline-flex items-center gap-1.5 text-xs font-700;
  color: var(--lm-c-text-muted);
}

.lm-project-card__status::before {
  content: '';
  @apply h-1.5 w-1.5 rounded-full;
  background: currentColor;
}

.lm-project-card__status--active {
  color: var(--lm-c-success);
}

.lm-project-card__status--wip {
  color: var(--lm-c-warning);
}

.lm-project-card__status--archived {
  color: var(--lm-c-text-muted);
}

.lm-project-card--with-cover .lm-project-card__status {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 6px rgb(0 0 0 / 0.28);
}

.lm-project-card--with-cover .lm-project-card__status--active {
  color: #b8ffcf;
}

.lm-project-card--with-cover .lm-project-card__status--wip {
  color: #ffe39a;
}

.lm-project-card__body {
  @apply grid gap-1.5;
}

.lm-project-card__title {
  @apply m-0 text-lg leading-7 font-800;
  color: var(--lm-c-text-primary);
}

.lm-project-card__desc {
  @apply m-0 text-sm leading-6;
  color: var(--lm-c-text-secondary);
}

.lm-project-card--with-cover .lm-project-card__title {
  color: white;
  text-shadow: 0 2px 10px rgb(0 0 0 / 0.34);
}

.lm-project-card--with-cover .lm-project-card__desc {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 6px rgb(0 0 0 / 0.3);
}

.lm-project-card__tags {
  @apply mt-auto flex flex-wrap gap-1.5;
}

.lm-project-card__tag {
  @apply inline-flex rounded-2 px-2 py-0.75 text-xs font-650;
  color: color-mix(in srgb, var(--lm-project-accent) 72%, var(--lm-c-text-primary));
  background: color-mix(in srgb, var(--lm-project-accent) 8%, transparent);
}

.lm-project-card--with-cover .lm-project-card__tag {
  color: rgba(255, 255, 255, 0.94);
  background: rgb(255 255 255 / 0.18);
  backdrop-filter: blur(8px);
}

.lm-project-card__actions {
  @apply flex flex-wrap gap-x-6 gap-y-2 pt-0.5;
}

.lm-project-card__action {
  @apply inline-flex min-h-7 items-center gap-1.5 p-0 text-xs font-750 no-underline transition-[color,transform] duration-180 ease-out;
  color: var(--lm-c-text-secondary);
  background: transparent;
}

.lm-project-card__action:hover {
  color: color-mix(in srgb, var(--lm-project-accent) 72%, var(--lm-c-text-primary));
  transform: translateY(-0.06rem);
}

.lm-project-card--with-cover .lm-project-card__action {
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 6px rgb(0 0 0 / 0.28);
}

.lm-project-card--with-cover .lm-project-card__action:hover {
  color: white;
}
</style>
