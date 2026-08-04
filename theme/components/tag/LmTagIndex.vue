<script setup lang="ts">
import type { TagGroup } from '../../features/tag'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  groups: TagGroup[]
  emptyLabel: string
  postCountLabel: string
}>()

const activeId = ref('')

const activeGroup = computed(() => {
  return props.groups.find(group => group.id === activeId.value) ?? props.groups[0]
})

watch(
  () => props.groups,
  (groups) => {
    if (!groups.length) {
      activeId.value = ''
      return
    }

    if (!groups.some(group => group.id === activeId.value))
      activeId.value = groups[0].id
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="groups.length" class="lm-tag-index">
    <LmTagCloud
      :items="groups"
      :active-id="activeId"
      @select="activeId = $event"
    />

    <Transition name="lm-tag-index-panel" mode="out-in">
      <section
        v-if="activeGroup"
        :key="activeGroup.id"
        class="lm-tag-index__panel"
      >
        <header class="lm-tag-index__head">
          <h2 class="lm-tag-index__title">
            {{ activeGroup.name }}
          </h2>

          <p class="lm-tag-index__meta">
            {{ activeGroup.count }} {{ postCountLabel }}
          </p>
        </header>

        <LmTagEntryList :entries="activeGroup.entries" />
      </section>
    </Transition>
  </div>

  <div v-else class="lm-tag-index__empty lm-empty-state">
    {{ emptyLabel }}
  </div>
</template>

<style scoped lang="scss">
.lm-tag-index {
  @apply flex flex-col gap-7;
}

.lm-tag-index__panel {
  @apply grid gap-4 border-t pt-5 md:grid-cols-[minmax(8rem,13rem)_minmax(0,1fr)] md:gap-7;
  border-color: var(--lm-c-border-accent);
}

.lm-tag-index__head {
  @apply min-w-0;
}

.lm-tag-index__title {
  @apply m-0 break-words text-2xl leading-8 font-900 md:text-3xl md:leading-10;
  color: var(--lm-c-text-primary);
}

.lm-tag-index__meta {
  @apply mt-1.5 mb-0 text-sm leading-6 font-700;
  color: var(--lm-c-text-muted);
}

.lm-tag-index-panel-enter-active,
.lm-tag-index-panel-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.lm-tag-index-panel-enter-from,
.lm-tag-index-panel-leave-to {
  opacity: 0;
  transform: translateY(0.2rem);
}

@media (max-width: 767px) {
  .lm-tag-index {
    @apply gap-6;
  }
}
</style>
