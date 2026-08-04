<script setup lang="ts">
interface ArticleInfoItem {
  icon: string
  text: string
}

withDefaults(defineProps<{
  publishedDate?: Date | number | string
  infoItems?: ArticleInfoItem[]
  categories?: string[]
  tags?: string[]
  cover?: boolean
}>(), {
  publishedDate: '',
  infoItems: () => [],
  categories: () => [],
  tags: () => [],
  cover: false,
})
</script>

<template>
  <div>
    <div
      class="lm-article-meta__info-row"
      :class="{ 'lm-article-meta__info-row--cover': cover }"
    >
      <span class="lm-article-meta__info-item">
        <span class="lm-article-meta__info-icon i-ri-time-line" />
        发布于
        <LmDate :date="publishedDate" inline />
      </span>

      <span
        v-for="item in infoItems"
        :key="item.text"
        class="lm-article-meta__info-item"
      >
        <span class="lm-article-meta__info-icon" :class="item.icon" />
        {{ item.text }}
      </span>
    </div>

    <div
      v-if="categories.length || tags.length"
      class="lm-article-meta__taxonomy-row"
      :class="cover ? 'lm-article-meta__taxonomy-row--cover' : 'lm-article-meta__taxonomy-row--plain'"
    >
      <span
        v-for="category in categories"
        :key="category"
        class="lm-article-meta__pill lm-article-meta__pill--category"
        :class="{ 'lm-article-meta__pill--cover': cover }"
      >
        <span class="i-ri-folder-2-line" />
        {{ category }}
      </span>

      <span
        v-for="tag in tags"
        :key="tag"
        class="lm-article-meta__pill"
        :class="{ 'lm-article-meta__pill--cover': cover }"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.lm-article-meta__info-row {
  @apply mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-600;
  color: var(--lm-c-text-secondary);
}

.lm-article-meta__info-row--cover {
  color: rgba(255, 255, 255, 0.94);
}

.lm-article-meta__info-item {
  @apply inline-flex items-center gap-1.5;
}

.lm-article-meta__info-icon {
  @apply inline-block text-base;
}

.lm-article-meta__taxonomy-row {
  @apply mt-4 flex flex-wrap items-center gap-2;
}

.lm-article-meta__taxonomy-row--cover {
  @apply mx-0 max-w-none;
}

.lm-article-meta__taxonomy-row--plain {
  @apply w-full justify-start;
}

.lm-article-meta__pill {
  @apply inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-600;
  color: var(--lm-c-text-secondary);
  background: var(--lm-c-brand-subtle);
  border: 1px solid var(--lm-c-border-accent);
}

.lm-article-meta__pill--category {
  color: var(--lm-c-brand-strong);
  background: color-mix(in srgb, var(--lm-c-brand-soft) 80%, transparent);
}

.lm-article-meta__pill--cover {
  color: rgba(255, 255, 255, 0.92);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.14);
}

.lm-article-meta__pill--category.lm-article-meta__pill--cover {
  color: white;
  background: color-mix(in srgb, var(--lm-c-brand) 18%, rgba(255, 255, 255, 0.08));
}
</style>
