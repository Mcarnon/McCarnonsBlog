<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePaginationItems } from '../../features/home'

const props = withDefaults(defineProps<{
  currentPage?: number
  totalPages: number
  basePath?: string
}>(), {
  currentPage: 1,
  basePath: '/',
})

const { t } = useI18n()
const {
  currentPage,
  paginationItems,
  prevLink,
  nextLink,
  totalPages,
} = usePaginationItems(props)

const paginationRenderKey = ref(0)

onMounted(() => {
  // 静态服务器可能为动态分页路径返回首页 HTML，其中残留第一页的链接与激活态。
  // 挂载后统一重建分页导航，使其完全采用当前客户端路由对应的响应式状态。
  paginationRenderKey.value += 1
})
</script>

<template>
  <nav
    v-if="paginationItems.length > 0"
    :key="paginationRenderKey"
    class="lm-pagination"
    :aria-label="t('pagination.label')"
  >
    <AppLink
      v-if="prevLink"
      class="lm-pagination__control"
      :to="prevLink"
      :aria-label="t('pagination.previous')"
    >
      <div i-ri-arrow-left-s-line class="lm-pagination__control-icon" />
    </AppLink>

    <div class="lm-pagination__pages">
      <template v-for="item in paginationItems" :key="item.key">
        <span v-if="item.type === 'ellipsis'" class="lm-pagination__ellipsis" aria-hidden="true">
          ...
        </span>

        <AppLink
          v-else
          class="lm-pagination__page"
          :class="{ 'is-current': item.current }"
          :to="item.to"
          :aria-current="item.current ? 'page' : undefined"
        >
          {{ item.page }}
        </AppLink>
      </template>
    </div>

    <div class="lm-pagination__mobile-status" aria-current="page">
      <span class="lm-pagination__mobile-current">{{ currentPage }}</span>
      <span class="lm-pagination__mobile-separator">/</span>
      <span>{{ totalPages }}</span>
    </div>

    <AppLink
      v-if="nextLink"
      class="lm-pagination__control"
      :to="nextLink"
      :aria-label="t('pagination.next')"
    >
      <div i-ri-arrow-right-s-line class="lm-pagination__control-icon" />
    </AppLink>
  </nav>
</template>

<style lang="scss" scoped>
@use '../../styles/mixins/surface' as *;

.lm-pagination {
  @apply mb-6 mt-6 flex items-center justify-center gap-3;
}

.lm-pagination__pages {
  @apply flex flex-wrap items-center justify-center gap-2;
}

.lm-pagination__control,
.lm-pagination__page,
.lm-pagination__mobile-status {
  @apply inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-transparent px-3.5 text-sm no-underline transition-all duration-200 ease-out;
  @include lm-surface-panel(
    color-mix(in srgb, var(--lm-c-bg-glass) 62%, transparent),
    color-mix(in srgb, var(--lm-c-border) 68%, transparent),
    0 10px 18px rgb(15 23 42 / 0.08),
    var(--lm-blur-panel)
  );
  color: var(--lm-c-text-secondary);
}

.lm-pagination__control,
.lm-pagination__page {
  &:hover {
    color: var(--lm-c-text-primary);
    border-color: color-mix(in srgb, var(--lm-c-border-hover) 84%, transparent);
    background: color-mix(in srgb, var(--lm-c-bg-glass) 74%, transparent);
    transform: translateY(-1px);
  }
}

.lm-pagination__page.is-current {
  color: var(--lm-c-brand);
  border-color: color-mix(in srgb, var(--lm-c-brand) 36%, var(--lm-c-border));
  background: color-mix(in srgb, var(--lm-c-brand) 14%, transparent);
  pointer-events: none;
}

.lm-pagination__control {
  @apply px-0;
  width: 2.5rem;
}

.lm-pagination__control-icon {
  @apply text-lg leading-none;
}

.lm-pagination__ellipsis {
  @apply inline-flex h-10 min-w-8 items-center justify-center text-sm;
  color: var(--lm-c-text-muted);
}

.lm-pagination__mobile-status {
  @apply hidden gap-1.5;
}

.lm-pagination__mobile-current {
  color: var(--lm-c-brand);
}

.lm-pagination__mobile-separator {
  color: var(--lm-c-text-muted);
}

@media (max-width: 640px) {
  .lm-pagination {
    @apply gap-2 px-3 py-3;
  }

  .lm-pagination__pages {
    @apply hidden;
  }

  .lm-pagination__mobile-status {
    @apply inline-flex h-9 min-w-18 px-3;
  }

  .lm-pagination__control {
    @apply h-9 min-w-9 px-0;
    width: 2.25rem;
  }
}
</style>
