import type { Post } from 'valaxy'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { useSiteConfig, useSiteStore } from 'valaxy'
import { computed, onScopeDispose, ref, toValue, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeConfig } from '../../shared/config'
import { isHomePaginationPath } from '../navigation'
import {
  captureActiveHomeHistoryEntryKey,
  consumeHomeHistoryPageCount,
  homeHistoryRestorationState,
  saveHomeHistoryPageCount,
} from './home-history-state'
import { resolvePageSize, resolvePaginationScope } from './pagination-scope'

/**
 * 构建首页文章流的分页、无限滚动、公告与动画响应式状态。
 *
 * @param curPage - 当前页码，可传普通值、响应式引用或 Getter，默认为第一页。
 * @param infiniteScrollTrigger - 可选的无限滚动观察元素引用；未传入时使用内部默认引用。
 * @returns 首页文章切片、分页状态、无限滚动状态及公告显示状态。
 */
export function useHomePostFeed(
  curPage: MaybeRefOrGetter<number | undefined> = 1,
  infiniteScrollTrigger?: Readonly<ShallowRef<HTMLElement | null>>,
) {
  const themeConfig = useThemeConfig()
  const siteConfig = useSiteConfig()
  const site = useSiteStore()
  const route = useRoute()
  const router = useRouter()
  const innerInfiniteScrollTrigger = ref<HTMLElement | null>(null)
  // 允许组件传入自有触发点；未传入时由 composable 暴露内部默认触发点。
  const resolvedInfiniteScrollTrigger = infiniteScrollTrigger ?? innerInfiniteScrollTrigger

  const allPosts = computed<Post[]>(() => site.postList ?? [])

  const paginationScope = computed(() => {
    return resolvePaginationScope({
      currentPage: toValue(curPage),
      itemCount: allPosts.value.length,
      itemsPerPage: resolvePageSize(
        themeConfig.value.pagination?.itemsPerPage,
        siteConfig.value.pageSize,
      ),
    })
  })

  const currentPage = computed(() => paginationScope.value.currentPage)
  const itemsPerPage = computed(() => paginationScope.value.itemsPerPage)
  const isPageOutOfRange = computed(() => paginationScope.value.isPageOutOfRange)
  const totalPages = computed(() => paginationScope.value.totalPages)

  const paginationType = computed(() => themeConfig.value.pagination?.type ?? 'standard')
  const isStandardPagination = computed(() => paginationType.value === 'standard')
  const isInfiniteScroll = computed(() => paginationType.value === 'infinite-scroll')

  const paginationAnimation = computed(() => {
    return isInfiniteScroll.value && Boolean(themeConfig.value.pagination?.animation)
  })

  const showHomeNotice = computed(() => {
    const notice = themeConfig.value.notice
    return notice.enable && Boolean(notice.message?.trim()) && ['home', 'global'].includes(notice.scope ?? 'home')
  })

  const infiniteScrollOptions = computed(() => {
    return themeConfig.value.pagination?.infiniteScrollOptions ?? {}
  })

  const infiniteScrollThreshold = computed(() => {
    const threshold = Number(infiniteScrollOptions.value.threshold)

    if (!Number.isFinite(threshold) || threshold < 0)
      return 200

    return Math.floor(threshold)
  })

  const infiniteScrollPreload = computed(() => {
    return infiniteScrollOptions.value.preload ?? true
  })

  const infiniteScrollRootMargin = computed(() => {
    return infiniteScrollPreload.value
      ? `0px 0px ${infiniteScrollThreshold.value}px 0px`
      : '0px'
  })

  const feedIdentity = computed(() => JSON.stringify({
    postIds: allPosts.value.map(post => String(post.path ?? '')),
    itemsPerPage: itemsPerPage.value,
    pagination: {
      type: paginationType.value,
      animation: paginationAnimation.value,
      preload: infiniteScrollPreload.value,
      threshold: infiniteScrollThreshold.value,
    },
  }))

  const activeHomeHistoryEntryKey = ref(
    captureActiveHomeHistoryEntryKey(route.fullPath),
  )
  const restoredVisiblePageCount = consumeHomeHistoryPageCount(
    activeHomeHistoryEntryKey.value,
    feedIdentity.value,
  )
  // 客户端回退挂载时同步初始化页数，使首轮 DOM 渲染直接具备可恢复的页面高度。
  const visiblePageCount = ref(
    isInfiniteScroll.value
      ? Math.min(restoredVisiblePageCount ?? 1, Math.max(totalPages.value, 1))
      : 1,
  )

  const visiblePostLimit = computed(() => {
    return visiblePageCount.value * itemsPerPage.value
  })

  // 无限滚动只增加可见页数，真实文章切片仍统一由 pagedPosts 负责。
  const hasMorePosts = computed(() => {
    if (!isInfiniteScroll.value)
      return false

    return visiblePostLimit.value < allPosts.value.length
  })

  const pagedPosts = computed<Post[]>(() => {
    if (isInfiniteScroll.value)
      return allPosts.value.slice(0, visiblePostLimit.value)

    if (isPageOutOfRange.value)
      return []

    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return allPosts.value.slice(start, end)
  })

  const showPagination = computed(() => {
    return isStandardPagination.value && totalPages.value > 1
  })

  /** 将当前页数持续保存到当前激活的首页历史条目。 */
  const saveActiveEntry = () => {
    saveHomeHistoryPageCount(
      activeHomeHistoryEntryKey.value,
      feedIdentity.value,
      visiblePageCount.value,
    )
  }

  /**
   * 在成功导航后切换首页历史条目，并按新条目独立恢复文章页数。
   *
   * @param routeLocation - 已确认导航的标准化目标位置。
   */
  const syncActiveHistoryEntry = (routeLocation: string) => {
    // 先落盘旧条目的最新值，再读取已切换完成的 window.history.state。
    saveActiveEntry()

    const nextEntryKey = captureActiveHomeHistoryEntryKey(routeLocation)

    if (nextEntryKey && nextEntryKey === activeHomeHistoryEntryKey.value)
      return

    const restoredPageCount = consumeHomeHistoryPageCount(nextEntryKey, feedIdentity.value)
    const nextPageCount = isInfiniteScroll.value
      ? Math.min(restoredPageCount ?? 1, Math.max(totalPages.value, 1))
      : 1

    activeHomeHistoryEntryKey.value = nextEntryKey
    visiblePageCount.value = nextPageCount
    saveActiveEntry()
  }

  const removeAfterEach = router.afterEach((to, _from, failure) => {
    if (!failure && isHomePaginationPath(to.path))
      syncActiveHistoryEntry(to.fullPath)
  })

  onScopeDispose(removeAfterEach)

  watch(feedIdentity, () => {
    visiblePageCount.value = 1
    saveActiveEntry()
  }, { flush: 'sync' })

  watch(visiblePageCount, saveActiveEntry, { flush: 'sync', immediate: true })

  const {
    pause: pauseInfiniteScrollObserver,
    resume: resumeInfiniteScrollObserver,
  } = useIntersectionObserver(
    () => resolvedInfiniteScrollTrigger.value,
    ([entry]) => {
      // 恢复握手未完成时拒绝已入队的旧观察回调，避免滚动定位前抢先增页。
      if (
        homeHistoryRestorationState.value.pending
        || !entry?.isIntersecting
        || !isInfiniteScroll.value
        || !hasMorePosts.value
      ) {
        return
      }

      visiblePageCount.value += 1
    },
    {
      // VueUse 接受响应式 rootMargin，配置变化时会自动重建观察器。
      rootMargin: infiniteScrollRootMargin,
    },
  )

  watch(
    () => homeHistoryRestorationState.value.pending,
    (isPending) => {
      if (isPending)
        pauseInfiniteScrollObserver()
      else
        resumeInfiniteScrollObserver()
    },
    { flush: 'sync', immediate: true },
  )

  return {
    currentPage,
    hasMorePosts,
    isInfiniteScroll,
    pagedPosts,
    paginationAnimation,
    showHomeNotice,
    showPagination,
    totalPages,
  }
}
