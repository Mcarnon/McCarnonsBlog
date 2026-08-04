<script setup lang="ts">
import type { LmFuseSearchResult } from '../../features/search'

defineProps<{
  results: LmFuseSearchResult[]
  selectedIndex: number
}>()

const emit = defineEmits<{
  navigate: [result: LmFuseSearchResult]
}>()
</script>

<template>
  <div class="lm-search-results">
    <button
      v-for="(result, index) in results"
      :key="result.id"
      type="button"
      class="lm-search-result"
      :class="{ 'lm-search-result--active': index === selectedIndex }"
      @click="emit('navigate', result)"
    >
      <span class="lm-search-result__title">
        <span
          v-for="(part, partIndex) in result.titleParts"
          :key="`${result.id}-title-${partIndex}`"
          :class="{ 'lm-search-result__highlight': part.highlighted }"
        >{{ part.text }}</span>
      </span>
      <span v-if="result.excerpt" class="lm-search-result__excerpt">
        <span
          v-for="(part, partIndex) in result.excerptParts"
          :key="`${result.id}-excerpt-${partIndex}`"
          :class="{ 'lm-search-result__highlight': part.highlighted }"
        >{{ part.text }}</span>
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.lm-search-results {
  @apply grid gap-2;
}

.lm-search-result {
  @apply flex w-full cursor-pointer flex-col rounded-3 border px-3.5 py-3 text-left transition-[border-color,background-color,transform] duration-180 ease-out;
  color: var(--lm-c-text-primary);
  border-color: color-mix(in srgb, var(--lm-c-brand) 10%, var(--lm-c-border));
  background: color-mix(in srgb, var(--lm-c-bg-glass) 42%, transparent);
}

.lm-search-result:hover,
.lm-search-result--active {
  border-color: color-mix(in srgb, var(--lm-c-brand) 34%, var(--lm-c-border));
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--lm-c-brand) 11%, transparent), transparent 56%),
    color-mix(in srgb, var(--lm-c-bg-glass) 64%, transparent);
  transform: translateY(-0.05rem);
}

.lm-search-result__title {
  @apply text-sm leading-6 font-800;
}

.lm-search-result__excerpt {
  @apply mt-1 line-clamp-2 text-xs leading-5;
  color: var(--lm-c-text-secondary);
}

.lm-search-result__highlight {
  color: var(--lm-c-brand);
  font-weight: 800;
}

@media (prefers-reduced-motion: reduce) {
  .lm-search-result {
    transition: none;
  }

  .lm-search-result:hover,
  .lm-search-result--active {
    transform: none;
  }
}
</style>
