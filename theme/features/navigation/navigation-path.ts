/** 匹配首页根路径及其数字分页路径。 */
const HOME_PAGINATION_PATH_RE = /^\/(?:page\/\d+\/?)?$/

/** 定位路径中的查询参数或哈希片段起点。 */
const PATHNAME_REGEX = /[?#]/

/** 匹配路径末尾连续的斜杠。 */
const TRAILING_SLASH_REGEX = /\/+$/

/**
 * 将导航路径规范化为不含查询参数、哈希和末尾斜杠的路径。
 *
 * @param path - 待规范化的导航路径。
 * @returns 规范化路径；空路径或缺少路径名时返回根路径 `/`。
 */
export function normalizePath(path: string) {
  if (!path)
    return '/'

  const [pathname] = path.split(PATHNAME_REGEX)
  if (!pathname)
    return '/'

  return pathname !== '/' ? pathname.replace(TRAILING_SLASH_REGEX, '') : '/'
}

/**
 * 判断当前路径是否位于目标导航分区内。
 *
 * @param current - 已规范化的当前路径。
 * @param target - 已规范化的目标分区路径。
 * @returns 当前路径等于目标路径或属于其下级路径时返回 `true`；根路径仅精确匹配。
 */
export function isSectionMatch(current: string, target: string) {
  if (target === '/')
    return current === '/'

  return current === target || current.startsWith(`${target}/`)
}

/**
 * 判断路径是否属于首页根路径或首页数字分页路径。
 *
 * @param path - 待判断的路由路径。
 * @returns 匹配首页或首页分页格式时返回 `true`。
 */
export function isHomePaginationPath(path: string) {
  return HOME_PAGINATION_PATH_RE.test(path)
}
