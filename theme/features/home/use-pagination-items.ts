import { computed, toValue } from 'vue'
import { normalizePageNumber } from './pagination-normalization'
import { isPaginationPageOutOfRange, normalizeTotalPages } from './pagination-scope'

/** 首页分页导航中的页码或省略号条目。 */
interface PaginationItem {
  /** 供 Vue 列表渲染使用的稳定键。 */
  key: string
  /** 条目类型，决定渲染页码链接或省略号。 */
  type: 'page' | 'ellipsis'
  /** 页码条目对应的目标页数。 */
  page?: number
  /** 页码条目的目标链接。 */
  to?: string
  /** 当前条目是否对应正在浏览的页码。 */
  current?: boolean
}

/** 构建首页分页条目所需的页码与基础路径。 */
interface UsePaginationItemsOptions {
  /** 当前页码，省略时按第一页处理；规范为不小于 1 的整数。 */
  currentPage?: number
  /** 文章流总页数。 */
  totalPages: number
  /** 首页分页链接的基础路径，默认为根路径。 */
  basePath?: string
}

/** 无需省略号时允许完整展示的最大页数。 */
const MAX_VISIBLE_PAGES = 6

/** 页数较多时在当前页两侧保留的相邻页数量。 */
const SIBLING_COUNT = 1

/**
 * 生成目标页码对应的首页链接，并定位到文章列表锚点。
 *
 * @param basePath - 首页分页基础路径。
 * @param page - 目标页码。
 * @returns 第一页或分页路由对应的带锚点链接。
 */
function resolvePageLink(basePath: string, page: number) {
  if (page <= 1)
    return `${basePath}#lm-post-list-section`

  const normalizedBasePath = basePath.endsWith('/')
    ? basePath.slice(0, -1)
    : basePath

  return `${normalizedBasePath}/page/${page}#lm-post-list-section`
}

/**
 * 创建包含起止页码的连续整数区间。
 *
 * @param start - 区间起始页码。
 * @param end - 区间结束页码。
 * @returns 连续页码数组；结束页小于起始页时返回空数组。
 */
function createPageRange(start: number, end: number) {
  if (end < start)
    return []

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

/**
 * 创建分页导航中的省略号条目。
 *
 * @param key - 省略号条目的稳定键。
 * @returns 不包含目标页码与链接的省略号条目。
 */
function createEllipsisItem(key: string): PaginationItem {
  return {
    key,
    type: 'ellipsis',
  }
}

/**
 * 构建首页分页条目以及上一页、下一页链接。
 *
 * 当前页码仅规范为不小于 1 的整数，不受总页数上限限制；总页数单独规范。
 *
 * @param options - 当前页、总页数与分页基础路径。
 * @returns 规范后的页码状态、分页条目和前后页链接。
 */
export function usePaginationItems(options: UsePaginationItemsOptions) {
  const totalPages = computed(() => normalizeTotalPages(toValue(options.totalPages)))
  const currentPage = computed(() => normalizePageNumber(toValue(options.currentPage)))
  const basePath = computed(() => toValue(options.basePath) || '/')
  const isPageOutOfRange = computed(() => {
    return isPaginationPageOutOfRange(currentPage.value, totalPages.value)
  })

  /**
   * 创建与当前分页状态关联的页码链接条目。
   *
   * @param page - 条目对应的目标页码。
   * @returns 包含链接与当前页标记的分页条目。
   */
  function createPageItem(page: number): PaginationItem {
    return {
      key: `page-${page}`,
      type: 'page',
      page,
      to: resolvePageLink(basePath.value, page),
      current: page === currentPage.value,
    }
  }

  const paginationItems = computed<PaginationItem[]>(() => {
    if (totalPages.value <= 0)
      return []

    // 页数较少时完整展示，避免省略号带来额外的认知成本。
    if (totalPages.value <= MAX_VISIBLE_PAGES)
      return createPageRange(1, totalPages.value).map(createPageItem)

    // 页数较多时固定保留首页和尾页，中间只展示当前页附近的窗口。
    const windowStart = Math.max(2, currentPage.value - SIBLING_COUNT)
    const windowEnd = Math.min(totalPages.value - 1, currentPage.value + SIBLING_COUNT)
    const leadingItems = windowStart > 2
      ? [createEllipsisItem('ellipsis-left')]
      : createPageRange(2, windowStart - 1).map(createPageItem)
    const trailingItems = windowEnd < totalPages.value - 1
      ? [createEllipsisItem('ellipsis-right')]
      : createPageRange(windowEnd + 1, totalPages.value - 1).map(createPageItem)

    return [
      createPageItem(1),
      ...leadingItems,
      ...createPageRange(windowStart, windowEnd).map(createPageItem),
      ...trailingItems,
      createPageItem(totalPages.value),
    ]
  })

  const prevLink = computed(() => {
    if (currentPage.value <= 1 || totalPages.value <= 0)
      return null

    if (isPageOutOfRange.value)
      return resolvePageLink(basePath.value, totalPages.value)

    return resolvePageLink(basePath.value, currentPage.value - 1)
  })

  const nextLink = computed(() => {
    if (currentPage.value >= totalPages.value)
      return null

    return resolvePageLink(basePath.value, currentPage.value + 1)
  })

  return {
    currentPage,
    totalPages,
    paginationItems,
    prevLink,
    nextLink,
  }
}
