<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  query: string
}>()

const emit = defineEmits<{
  close: []
  keydown: [event: KeyboardEvent]
  updateQuery: [value: string]
}>()

const { t } = useI18n()

function resolveInputValue(event: Event) {
  return (event.target as HTMLInputElement | null)?.value ?? ''
}
</script>

<template>
  <div class="lm-search-header">
    <div i-ri-search-line class="text-[var(--lm-c-text-muted)]" />
    <input
      class="lm-search-header__input"
      data-modal-initial-focus
      type="text"
      :value="props.query"
      :placeholder="t('search.placeholder')"
      @input="emit('updateQuery', resolveInputValue($event))"
      @keydown="emit('keydown', $event)"
    >
    <button
      type="button"
      class="lm-search-header__close"
      :aria-label="t('button.closeSearch')"
      @click="emit('close')"
    >
      <div i-ri-close-line />
    </button>
  </div>
</template>

<style scoped lang="scss">
.lm-search-header {
  @apply px-4 py-3 border-b border-[var(--lm-c-divider)] flex gap-3 items-center;
}

.lm-search-header__input {
  @apply text-[var(--lm-c-text-primary)] outline-none bg-transparent w-full;
}

.lm-search-header__close {
  @apply text-[var(--lm-c-text-secondary)] rounded-full inline-flex h-8 w-8 items-center justify-center transition-colors duration-200 ease-out hover:text-[var(--lm-c-text-primary)];
}

@media (prefers-reduced-motion: reduce) {
  .lm-search-header__close {
    transition: none;
  }
}
</style>
