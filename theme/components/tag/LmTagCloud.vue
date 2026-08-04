<script setup lang="ts">
import type { TagCloudSourceItem } from '../../features/tag'
import { useTagCloud } from '../../features/tag'

const props = defineProps<{
  items: TagCloudSourceItem[]
  activeId: string
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

const cloudRows = useTagCloud(() => props.items)
</script>

<template>
  <div class="lm-tag-cloud">
    <div
      v-for="row in cloudRows"
      :key="row.id"
      class="lm-tag-cloud__row"
    >
      <button
        v-for="item in row.items"
        :key="item.id"
        type="button"
        class="lm-tag-cloud__item"
        :class="{ 'lm-tag-cloud__item--active': item.id === activeId }"
        :style="{
          '--lm-tag-cloud-font-size': item.fontSize,
          '--lm-tag-cloud-font-weight': item.fontWeight,
          '--lm-tag-cloud-opacity': item.opacity,
          '--lm-tag-cloud-shift-x': item.shiftX,
          '--lm-tag-cloud-shift-y': item.shiftY,
        }"
        :aria-pressed="item.id === activeId"
        :aria-label="`${item.name}, ${item.count}`"
        @click="emit('select', item.id)"
      >
        <span class="lm-tag-cloud__name">{{ item.name }}</span>
        <span class="lm-tag-cloud__count">{{ item.count }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lm-tag-cloud {
  @apply flex min-h-40 flex-col items-center justify-center gap-2.5 py-3 text-center;
}

.lm-tag-cloud__row {
  @apply flex flex-wrap items-baseline justify-center gap-x-5 gap-y-2;
}

.lm-tag-cloud__item {
  @apply relative inline-flex items-baseline border-0 bg-transparent px-1 py-0.5 leading-none transition-[color,opacity,transform] duration-200 ease-out;
  color: var(--lm-c-text-secondary);
  font-size: var(--lm-tag-cloud-font-size);
  font-weight: var(--lm-tag-cloud-font-weight);
  opacity: var(--lm-tag-cloud-opacity);
  transform: translate(var(--lm-tag-cloud-shift-x), var(--lm-tag-cloud-shift-y));
}

.lm-tag-cloud__item:hover,
.lm-tag-cloud__item:focus-visible {
  color: var(--lm-c-brand-strong);
  opacity: 1;
  outline: none;
  transform: translate(var(--lm-tag-cloud-shift-x), calc(var(--lm-tag-cloud-shift-y) - 0.08rem));
}

.lm-tag-cloud__item--active {
  color: var(--lm-c-text-primary);
  opacity: 1;
}

.lm-tag-cloud__item--active .lm-tag-cloud__name {
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--lm-c-brand) 70%, transparent);
  text-decoration-thickness: 0.12em;
  text-underline-offset: 0.18em;
}

.lm-tag-cloud__count {
  @apply pointer-events-none absolute inline-flex items-center justify-center text-[0.5em] font-800 transition-opacity duration-200 ease-out;
  top: -0.35em;
  right: -0.75em;
  color: var(--lm-c-text-muted);
  opacity: 0;
}

.lm-tag-cloud__item:hover .lm-tag-cloud__count,
.lm-tag-cloud__item:focus-visible .lm-tag-cloud__count {
  opacity: 0.72;
}

.lm-tag-cloud__item--active .lm-tag-cloud__count {
  color: var(--lm-c-brand-strong);
  opacity: 0.86;
}

@media (max-width: 639px) {
  .lm-tag-cloud {
    @apply min-h-32 gap-2;
  }

  .lm-tag-cloud__row {
    @apply gap-x-4;
  }
}
</style>
