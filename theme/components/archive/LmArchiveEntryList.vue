<script setup lang="ts">
import type { ArchiveEntry } from '../../features/archive'
import { formatDate } from 'valaxy'

defineProps<{
  entries: ArchiveEntry[]
}>()

/** 将归档条目的日期格式化为列表展示文本。 */
function formatEntryDate(date?: string | number | Date) {
  return formatDate(date ?? '')
}
</script>

<template>
  <ol class="lm-archive-entry-list">
    <li
      v-for="entry in entries"
      :key="entry.path"
      class="lm-archive-entry-list__item"
    >
      <time class="lm-archive-entry-list__date" :datetime="formatEntryDate(entry.date)">
        {{ formatEntryDate(entry.date) }}
      </time>

      <RouterLink class="lm-archive-entry-list__title" :to="entry.path">
        {{ entry.title }}
      </RouterLink>

      <p v-if="entry.categories.length" class="lm-archive-entry-list__meta">
        {{ entry.categories.join(' / ') }}
      </p>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.lm-archive-entry-list {
  @apply m-0 flex list-none flex-col p-0;
}

.lm-archive-entry-list__item {
  @apply border-b py-4;
  border-color: color-mix(in srgb, var(--lm-c-brand) 8%, var(--lm-c-border));
}

.lm-archive-entry-list__item:first-child {
  @apply pt-1;
}

.lm-archive-entry-list__item:last-child {
  @apply border-b-0 pb-0;
}

.lm-archive-entry-list__date {
  @apply text-xs font-700 uppercase tracking-[0.14em];
  color: var(--lm-c-text-muted);
}

.lm-archive-entry-list__title {
  @apply mt-2 block text-base leading-7 font-700 no-underline;
  color: var(--lm-c-text-primary);
  transition: color 0.2s ease;
}

.lm-archive-entry-list__title:hover {
  color: var(--lm-c-brand-strong);
}

.lm-archive-entry-list__meta {
  @apply mt-1.5 mb-0 text-sm leading-6;
  color: var(--lm-c-text-secondary);
}
</style>
