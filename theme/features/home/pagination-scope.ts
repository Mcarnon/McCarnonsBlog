import { normalizePageNumber, normalizePageSize } from './pagination-normalization'

/** 首页文章流在主题和站点均未配置时采用的默认每页文章数。 */
export const DEFAULT_HOME_PAGE_SIZE = 10

/** 计算分页作用域所需的原始输入。 */
export interface PaginationScopeOptions {
  /** 当前页码。 */
  currentPage?: unknown
  /** 当前数据集的条目总数。 */
  itemCount: number
  /** 每页条目数。 */
  itemsPerPage: number
}

/**
 * 按优先级选择第一个有效的分页大小。
 *
 * @param candidates - 从高到低排列的分页大小候选值。
 * @returns 第一个有效值；全部无效时返回首页默认分页大小。
 */
export function resolvePageSize(...candidates: unknown[]) {
  for (const candidate of candidates) {
    const pageSize = normalizePageSize(candidate)

    if (pageSize !== undefined)
      return pageSize
  }

  return DEFAULT_HOME_PAGE_SIZE
}

/**
 * 将总页数规范为不小于 0 的整数。
 *
 * @param value - 待规范的总页数。
 * @returns 有效总页数；非法或小于 1 时返回 0。
 */
export function normalizeTotalPages(value: unknown) {
  const totalPages = Math.floor(Number(value))

  return Number.isFinite(totalPages) && totalPages >= 1 ? totalPages : 0
}

/**
 * 判断当前页是否超过分页数据的有效范围。
 *
 * 空数据集仍允许访问第一页，因此总页数按至少一页参与边界比较。
 *
 * @param currentPage - 当前页码。
 * @param totalPages - 数据集总页数。
 * @returns 当前页超过有效末页时返回 true。
 */
export function isPaginationPageOutOfRange(currentPage: unknown, totalPages: unknown) {
  return normalizePageNumber(currentPage) > Math.max(normalizeTotalPages(totalPages), 1)
}

/**
 * 根据页码、条目总数与分页大小解析完整分页作用域。
 *
 * @param options - 分页作用域输入。
 * @returns 规范化后的当前页、分页大小、总页数和越界状态。
 */
export function resolvePaginationScope(options: PaginationScopeOptions) {
  const currentPage = normalizePageNumber(options.currentPage)
  const itemsPerPage = resolvePageSize(options.itemsPerPage)
  const rawItemCount = Number(options.itemCount)
  const itemCount = Number.isFinite(rawItemCount)
    ? Math.max(0, Math.floor(rawItemCount))
    : 0
  const totalPages = itemCount === 0
    ? 0
    : Math.ceil(itemCount / itemsPerPage)

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    isPageOutOfRange: isPaginationPageOutOfRange(currentPage, totalPages),
  }
}
