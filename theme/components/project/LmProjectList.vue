<script setup lang="ts">
import type { ResolvedProjectGroup } from '../../features/project'

defineProps<{
  groups: ResolvedProjectGroup[]
  emptyLabel: string
}>()
</script>

<template>
  <div v-if="groups.length" class="lm-project-list">
    <section
      v-for="group in groups"
      :key="group.title"
      class="lm-project-list__section"
    >
      <div class="lm-project-list__header">
        <h2 class="lm-project-list__title">
          {{ group.title }}
        </h2>
        <p v-if="group.desc" class="lm-project-list__desc">
          {{ group.desc }}
        </p>
      </div>

      <div class="lm-project-list__grid">
        <LmProjectCard
          v-for="item in group.items"
          :key="item.name"
          :item="item"
        />
      </div>
    </section>
  </div>

  <div v-else class="lm-project-list__empty lm-empty-state">
    {{ emptyLabel }}
  </div>
</template>

<style scoped lang="scss">
.lm-project-list {
  @apply grid gap-10;
}

.lm-project-list__section {
  @apply grid gap-5;
}

.lm-project-list__header {
  @apply grid gap-2;
}

.lm-project-list__title {
  @apply relative isolate m-0 inline-flex w-fit text-2xl leading-8 font-900;
  color: var(--lm-c-text-primary);
}

.lm-project-list__title::after {
  content: '';
  @apply absolute left-0 h-2.5 rounded-full;
  right: -0.35rem;
  bottom: 0.08rem;
  z-index: var(--lm-z-behind);
  background: color-mix(in srgb, var(--lm-c-brand) 24%, transparent);
}

.lm-project-list__desc {
  @apply m-0 max-w-2xl text-sm leading-6;
  color: var(--lm-c-text-secondary);
}

.lm-project-list__grid {
  @apply grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3;
}
</style>
