<script setup lang="ts">
import type { TagEntry } from '../../features/tag'
import { formatDate } from 'valaxy'

defineProps<{
  entries: TagEntry[]
}>()

/** 将标签条目的日期格式化为列表展示文本。 */
function formatEntryDate(date?: string | number | Date) {
  return formatDate(date ?? '')
}
</script>

<template>
  <ol class="lm-tag-entry-list">
    <li
      v-for="entry in entries"
      :key="entry.path"
      class="lm-tag-entry-list__item"
    >
      <RouterLink class="lm-tag-entry-list__link" :to="entry.path">
        {{ entry.title }}
      </RouterLink>

      <time class="lm-tag-entry-list__date" :datetime="formatEntryDate(entry.date)">
        {{ formatEntryDate(entry.date) }}
      </time>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.lm-tag-entry-list {
  @apply m-0 grid list-none gap-3 p-0;
}

.lm-tag-entry-list__item {
  @apply grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-b pb-3;
  border-color: color-mix(in srgb, var(--lm-c-brand) 8%, var(--lm-c-border));
}

.lm-tag-entry-list__item:last-child {
  @apply border-b-0 pb-0;
}

.lm-tag-entry-list__link {
  @apply min-w-0 text-base leading-7 font-700 no-underline;
  color: var(--lm-c-text-primary);
  transition: color 0.2s ease;
}

.lm-tag-entry-list__link:hover {
  color: var(--lm-c-brand-strong);
}

.lm-tag-entry-list__date {
  @apply text-xs leading-5 font-700 uppercase;
  color: var(--lm-c-text-muted);
}

@media (max-width: 639px) {
  .lm-tag-entry-list__item {
    @apply grid-cols-1 items-start gap-x-0;
  }
}
</style>
