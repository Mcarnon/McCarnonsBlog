<script setup lang="ts">
defineProps<{
  title: string
  cover?: string
  stats?: Array<{
    label: string
    value: number | string
  }>
}>()
</script>

<template>
  <header
    class="lm-aggregate-header"
    :class="{ 'lm-aggregate-header--plain': !cover }"
  >
    <div v-if="cover" class="lm-aggregate-header__cover">
      <img
        :src="cover"
        alt=""
        class="lm-aggregate-header__cover-image"
      >

      <div class="lm-aggregate-header__cover-overlay">
        <div class="lm-aggregate-header__cover-content">
          <div class="lm-aggregate-header__content lm-aggregate-header__content--cover">
            <LmAggregateMeta
              class="lm-aggregate-header__meta"
              :title="title"
              :stats="stats"
              cover
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="lm-aggregate-header__content"
      :class="{ 'lm-aggregate-header__content--plain': !cover }"
    >
      <LmAggregateMeta
        :title="title"
        :stats="stats"
      />
    </div>
  </header>
</template>

<style scoped lang="scss">
.lm-aggregate-header {
  @apply w-full pb-8;
}

.lm-aggregate-header--plain {
  @apply md:pt-24 pt-22;
}

.lm-aggregate-header__content {
  @apply flex flex-col;
}

.lm-aggregate-header__content--plain {
  @apply mx-auto max-w-5xl px-4 text-left sm:px-6 xl:px-0;
}

.lm-aggregate-header__cover {
  @apply relative overflow-hidden;
  min-height: 22rem;
}

.lm-aggregate-header__cover-image {
  @apply absolute inset-0 h-full w-full object-cover;
}

.lm-aggregate-header__cover-overlay {
  @apply relative h-full w-full;
  min-height: 22rem;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.02) 0%,
      rgba(0, 0, 0, 0.1) 60%,
      color-mix(in srgb, var(--lm-surface-reading-bg) 30%, transparent) 100%
    ),
    radial-gradient(circle at 20% 44%, rgba(255, 255, 255, 0.11), transparent 34%),
    linear-gradient(90deg, rgba(10, 16, 28, 0.07) 0%, rgba(10, 16, 28, 0.015) 72%);
}

.lm-aggregate-header__cover-content {
  @apply mx-auto flex h-full w-full max-w-5xl justify-center px-4 sm:px-6 xl:px-0;
  min-height: 22rem;
}

.lm-aggregate-header__content--cover {
  @apply mx-auto w-full max-w-[27rem] justify-end py-7 text-left;
  min-height: 22rem;
}

.lm-aggregate-header__meta {
  @apply self-center;
}

@media (max-width: 767px) {
  .lm-aggregate-header__cover,
  .lm-aggregate-header__cover-overlay,
  .lm-aggregate-header__cover-content,
  .lm-aggregate-header__content--cover {
    min-height: 15rem;
  }

  .lm-aggregate-header__content--cover {
    @apply py-5;
  }
}
</style>
