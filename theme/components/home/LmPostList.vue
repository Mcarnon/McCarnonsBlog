<script setup lang="ts">
import type { Post } from 'valaxy'
import { useElementSize } from '@vueuse/core'
import { useSiteStore } from 'valaxy'
import { computed, ref } from 'vue'
import { clampColumnCount, resolveGridColumnCount, resolveLengthToPx } from '../../features/home'
import { getRootFontSize } from '../../shared/browser'
import { useThemeConfig } from '../../shared/config'

const props = withDefaults(defineProps<{
  type?: string
  posts?: Post[]
  curPage?: number
  animateItems?: boolean
}>(), {
  curPage: 1,
  animateItems: false,
})

const themeConfig = useThemeConfig()
const site = useSiteStore()

const listSection = ref<HTMLElement | null>(null)
const { width: containerWidth } = useElementSize(() => listSection.value)

const title = computed(() => themeConfig.value.postList.title ?? 'Discovery')

const allPosts = computed(() => {
  const list = site.postList || []
  if (!props.type)
    return list

  return list.filter(post => post.type === props.type)
})

const posts = computed(() => props.posts ?? allPosts.value)

/** 首页文章卡片未配置时采用的默认最小宽度。 */
const DEFAULT_MIN_CARD_WIDTH = '18rem'

/** 首页文章网格中相邻卡片的固定像素间距。 */
const GRID_GAP_PX = 16

const maxColumns = computed(() => {
  return clampColumnCount(themeConfig.value.postList.maxColumns ?? 1)
})

const minCardWidth = computed(() => {
  return themeConfig.value.postList.minCardWidth ?? DEFAULT_MIN_CARD_WIDTH
})

const minCardWidthPx = computed(() => {
  return resolveLengthToPx(minCardWidth.value, 288, getRootFontSize())
})

const actualColumns = computed(() => {
  return resolveGridColumnCount(containerWidth.value, minCardWidthPx.value, maxColumns.value, GRID_GAP_PX)
})

const cardLayout = computed(() => {
  return actualColumns.value === 1 ? 'alternating' : 'text-first'
})

const gridStyle = computed(() => {
  return {
    '--lm-post-list-columns': String(actualColumns.value),
  }
})
</script>

<template>
  <section id="lm-post-list-section" ref="listSection" class="py-6 md:py-8">
    <div class="mb-6">
      <h2 class="text-[1.5rem] text-[var(--lm-c-text-primary)] leading-[1.3] font-700 m-0">
        {{ title }}
      </h2>
    </div>
    <ul v-if="posts.length > 0" :style="gridStyle" class="lm-post-list m-0 p-0 list-none">
      <li
        v-for="(post, index) in posts"
        :key="post.path"
        class="lm-post-list__item m-0"
        :class="{ 'lm-post-list__item--animated': props.animateItems }"
      >
        <LmPostCard :post="post" :index="index" :layout="cardLayout" />
      </li>
    </ul>
    <div
      v-else
      class="text-[var(--lm-c-text-secondary)] px-4 py-12 text-center border border-[var(--lm-c-border)] rounded-4 border-dashed bg-[color-mix(in_srgb,var(--lm-c-bg-glass)_72%,transparent)]"
    >
      No posts found.
    </div>
  </section>
</template>

<style scoped lang="scss">
.lm-post-list {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(var(--lm-post-list-columns, 1), minmax(0, 1fr));
}

.lm-post-list__item {
  min-width: 0;
  display: flex;
  container-type: inline-size;
}

.lm-post-list__item--animated {
  animation: lm-post-list-item-enter 0.45s ease-out both;
}

@keyframes lm-post-list-item-enter {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .lm-post-list__item--animated {
    animation: none;
  }
}
</style>
