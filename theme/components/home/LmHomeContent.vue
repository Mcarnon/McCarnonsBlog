<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useHomePostFeed } from '../../features/home'

const props = withDefaults(defineProps<{
  curPage?: number
}>(), {
  curPage: 1,
})

const infiniteScrollTrigger = useTemplateRef<HTMLElement>('infiniteScrollTrigger')

const {
  currentPage,
  hasMorePosts,
  isInfiniteScroll,
  pagedPosts,
  paginationAnimation,
  showHomeNotice,
  showPagination,
  totalPages,
} = useHomePostFeed(() => props.curPage, infiniteScrollTrigger)
</script>

<template>
  <div id="lm-home-content" class="flex flex-col">
    <LmNotice v-if="showHomeNotice" />

    <LmPinned />

    <LmPostList :posts="pagedPosts" :cur-page="currentPage" :animate-items="paginationAnimation" />

    <LmPagination
      v-if="showPagination"
      :current-page="currentPage"
      :total-pages="totalPages"
      base-path="/"
    />

    <div
      v-if="isInfiniteScroll && hasMorePosts"
      ref="infiniteScrollTrigger"
      class="h-1 w-full"
      aria-hidden="true"
    />
  </div>
</template>
