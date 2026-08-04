<script setup lang="ts">
import type { CategoryEntry } from '../../features/category'
import { formatDate } from 'valaxy'

defineProps<{
  entries: CategoryEntry[]
}>()

/** 将分类条目的日期格式化为列表展示文本。 */
function formatEntryDate(date?: string | number | Date) {
  return formatDate(date ?? '')
}
</script>

<template>
  <ul class="lm-category-entry-list">
    <li
      v-for="entry in entries"
      :key="entry.path"
      class="lm-category-entry-list__item"
    >
      <RouterLink class="lm-category-entry-list__link" :to="entry.path">
        {{ entry.title }}
      </RouterLink>

      <time class="lm-category-entry-list__date" :datetime="formatEntryDate(entry.date)">
        {{ formatEntryDate(entry.date) }}
      </time>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.lm-category-entry-list {
  @apply m-0 grid list-none gap-2 p-0;
}

.lm-category-entry-list__item {
  @apply grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-4 px-3 py-2;
  background: color-mix(in srgb, var(--lm-c-brand-soft) 18%, transparent);
}

.lm-category-entry-list__link {
  @apply min-w-0 text-sm leading-6 font-700 no-underline;
  color: var(--lm-c-text-primary);
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.lm-category-entry-list__link:hover {
  color: var(--lm-c-brand-strong);
  transform: translateX(0.08rem);
}

.lm-category-entry-list__date {
  @apply text-[0.72rem] leading-none font-700 uppercase tracking-[0.12em];
  color: var(--lm-c-text-muted);
}

@media (max-width: 639px) {
  .lm-category-entry-list__item {
    @apply grid-cols-1 items-start gap-x-0;
  }

  .lm-category-entry-list__date {
    @apply mt-0.5;
  }
}
</style>
