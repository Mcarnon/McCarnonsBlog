<script setup lang="ts">
import type { CategoryNode } from '../../features/category'
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  nodes: CategoryNode[]
  depth?: number
  emptyLabel?: string
  postCountLabel: string
  childCountLabel: string
  uncategorizedLabel: string
}>(), {
  depth: 0,
  emptyLabel: '',
})

const expandedPaths = ref(new Set<string>())

/** 将未分类节点的内部名称转换为本地化展示文本。 */
function displayName(name: string) {
  return name === 'Uncategorized' ? props.uncategorizedLabel : name
}

/** 判断指定分类节点当前是否展开。 */
function isExpanded(node: CategoryNode) {
  return expandedPaths.value.has(node.fullPath)
}

/** 切换指定分类节点的展开状态。 */
function toggleNode(node: CategoryNode) {
  const nextPaths = new Set(expandedPaths.value)

  if (nextPaths.has(node.fullPath))
    nextPaths.delete(node.fullPath)
  else
    nextPaths.add(node.fullPath)

  expandedPaths.value = nextPaths
}
</script>

<template>
  <div v-if="nodes.length" class="lm-category-tree" :class="{ 'lm-category-tree--nested': depth > 0 }">
    <section
      v-for="node in nodes"
      :key="node.fullPath"
      class="lm-category-tree__node"
    >
      <header class="lm-category-tree__head">
        <p v-if="node.parentPath" class="lm-category-tree__breadcrumb">
          {{ node.parentPath }}
        </p>

        <button
          class="lm-category-tree__trigger"
          type="button"
          :aria-expanded="isExpanded(node)"
          @click="toggleNode(node)"
        >
          <span class="lm-category-tree__trigger-main">
            <span class="lm-category-tree__toggle" :class="{ 'lm-category-tree__toggle--open': isExpanded(node) }">
              <span class="i-ri-arrow-right-s-line" />
            </span>

            <span class="lm-category-tree__title">
              {{ displayName(node.name) }}
            </span>
          </span>

          <span class="lm-category-tree__stats">
            <span class="lm-category-tree__stats-item">
              {{ node.total }} {{ postCountLabel }}
            </span>
            <span v-if="node.childCount" class="lm-category-tree__stats-item">
              {{ node.childCount }} {{ childCountLabel }}
            </span>
          </span>
        </button>
      </header>

      <Transition name="lm-category-tree-expand">
        <div v-if="isExpanded(node)" class="lm-category-tree__panel">
          <div v-if="node.entries.length" class="lm-category-tree__entries">
            <LmCategoryEntryList :entries="node.entries" />
          </div>

          <div v-if="node.children.length" class="lm-category-tree__children">
            <LmCategoryTree
              :nodes="node.children"
              :depth="depth + 1"
              :post-count-label="postCountLabel"
              :child-count-label="childCountLabel"
              :uncategorized-label="uncategorizedLabel"
            />
          </div>
        </div>
      </Transition>
    </section>
  </div>

  <div v-else-if="emptyLabel && depth === 0" class="lm-category-tree__empty lm-empty-state">
    {{ emptyLabel }}
  </div>
</template>

<style scoped lang="scss">
.lm-category-tree {
  @apply grid gap-4 md:gap-5;
}

.lm-category-tree--nested {
  @apply mt-4 pl-4 md:pl-5;
  border-left: 1px solid color-mix(in srgb, var(--lm-c-brand) 12%, var(--lm-c-border));
}

.lm-category-tree__node {
  @apply border-b pb-4 md:pb-5;
  border-color: color-mix(in srgb, var(--lm-c-brand) 10%, var(--lm-c-border));
}

.lm-category-tree__node:last-child {
  @apply border-b-0 pb-0;
}

.lm-category-tree__head {
  @apply flex flex-col gap-2;
}

.lm-category-tree__breadcrumb {
  @apply m-0 text-xs leading-5 font-700 uppercase tracking-[0.14em];
  color: var(--lm-c-text-muted);
}

.lm-category-tree__title {
  @apply text-xl leading-8 font-800 md:text-2xl;
  color: var(--lm-c-text-primary);
}

.lm-category-tree__trigger {
  @apply flex w-full cursor-pointer items-start justify-between gap-4 rounded-4 border-0 bg-transparent px-2 py-2 text-left transition-colors duration-220 ease-out;
  color: inherit;
  font: inherit;
}

.lm-category-tree__trigger:hover,
.lm-category-tree__trigger:focus-visible {
  background: color-mix(in srgb, var(--lm-c-brand) 8%, transparent);
  outline: none;
}

.lm-category-tree__trigger-main {
  @apply flex min-w-0 items-start gap-2.5;
}

.lm-category-tree__toggle {
  @apply mt-1.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-sm transition-transform duration-220 ease-out;
  color: var(--lm-c-text-secondary);
  background: var(--lm-c-brand-subtle);
}

.lm-category-tree__toggle--open {
  transform: rotate(90deg);
  color: var(--lm-c-brand);
}

.lm-category-tree__stats {
  @apply flex shrink-0 flex-wrap justify-end gap-x-3 gap-y-1 text-sm leading-6 self-center;
  color: var(--lm-c-text-secondary);
}

.lm-category-tree__stats-item {
  @apply inline-flex items-center gap-1.5;
}

.lm-category-tree__stats-item::before {
  content: '';
  @apply inline-block h-1.5 w-1.5 rounded-full;
  background: color-mix(in srgb, var(--lm-c-brand) 60%, transparent);
}

.lm-category-tree__entries {
  @apply mt-3;
}

.lm-category-tree__children {
  @apply mt-4;
}

.lm-category-tree__panel {
  overflow: hidden;
}

.lm-category-tree-expand-enter-active,
.lm-category-tree-expand-leave-active {
  transition:
    opacity 280ms ease,
    transform 280ms ease,
    max-height 280ms ease;
}

.lm-category-tree-expand-enter-from,
.lm-category-tree-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-0.25rem);
}

.lm-category-tree-expand-enter-to,
.lm-category-tree-expand-leave-from {
  max-height: 42rem;
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 767px) {
  .lm-category-tree__title {
    @apply text-lg leading-7;
  }

  .lm-category-tree__trigger {
    @apply flex-col gap-2;
  }

  .lm-category-tree__stats {
    @apply justify-start pl-7;
  }
}
</style>
