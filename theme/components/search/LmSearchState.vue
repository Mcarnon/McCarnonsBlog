<script setup lang="ts">
defineProps<{
  hint?: string
  title?: string
}>()
</script>

<template>
  <div class="lm-search-state">
    <template v-if="title">
      <p class="lm-search-state__title">
        {{ title }}
      </p>
      <p v-if="hint" class="lm-search-state__hint">
        {{ hint }}
      </p>
    </template>
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<style scoped lang="scss">
.lm-search-state {
  @apply px-4 py-8 text-center text-sm leading-7;
  color: var(--lm-c-text-muted);
}

.lm-search-state__title {
  @apply m-0 text-base font-800;
  color: var(--lm-c-text-primary);
}

.lm-search-state__hint {
  @apply m-0 mt-1;
}
</style>
