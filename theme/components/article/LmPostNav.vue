<script setup lang="ts">
import { useFrontmatter, usePrevNext } from 'valaxy'
import { computed } from 'vue'

const frontmatter = useFrontmatter()
const [prev, next] = usePrevNext()

const navEnabled = computed(() => frontmatter.value.nav !== false)
const prevPath = computed(() => prev.value?.path || '')
const prevTitle = computed(() => prev.value?.title || '')
const nextPath = computed(() => next.value?.path || '')
const nextTitle = computed(() => next.value?.title || '')
const hasPostNav = computed(() => navEnabled.value && (!!prevPath.value || !!nextPath.value))
</script>

<template>
  <footer v-if="hasPostNav" class="lm-post-nav">
    <RouterLink
      v-if="prevPath"
      :to="prevPath"
      class="lm-post-nav__item"
    >
      <span class="lm-post-nav__label">Previous Article</span>
      <span class="lm-post-nav__title">{{ prevTitle }}</span>
    </RouterLink>

    <RouterLink
      v-if="nextPath"
      :to="nextPath"
      class="lm-post-nav__item lm-post-nav__item--next"
    >
      <span class="lm-post-nav__label">Next Article</span>
      <span class="lm-post-nav__title">{{ nextTitle }}</span>
    </RouterLink>
  </footer>
</template>

<style lang="scss" scoped>
@use '../../styles/mixins/surface' as *;

.lm-post-nav {
  @apply mx-auto mt-4 flex w-full flex-col gap-3 md:flex-row md:justify-between px-4 sm:px-6 xl:px-0;
}

.lm-post-nav__item {
  @include lm-surface-panel;
  @apply flex min-w-0 flex-col rounded px-5 py-4 no-underline transition-transform duration-200 ease-out md:flex-1;

  &:hover {
    transform: translateY(-2px);
  }

  &:only-child {
    @apply w-full;
  }
}

.lm-post-nav__item--next {
  @apply text-left md:text-right;
}

.lm-post-nav__item:not(:only-child) {
  @apply md:max-w-[calc(50%-0.375rem)];
}

.lm-post-nav__label {
  @apply text-xs tracking-wide uppercase;
  color: var(--lm-c-text-muted);
}

.lm-post-nav__title {
  @apply mt-2 text-base leading-6 font-700;
  color: var(--lm-c-text-primary);
}
</style>
