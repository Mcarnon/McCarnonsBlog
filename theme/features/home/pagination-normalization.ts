/**
 * 将输入规范为不小于 1 的整数页码。
 *
 * @param value - 待规范的当前页码。
 * @returns 有限输入向下取整并限制为至少 1；非法输入返回 1。
 */
export function normalizePageNumber(value: unknown) {
  const page = Number(value)

  if (!Number.isFinite(page))
    return 1

  return Math.max(1, Math.floor(page))
}

/**
 * 将分页大小规范化为不小于 1 的有限整数。
 *
 * @param value - 待规范化的分页大小。
 * @returns 有效分页大小；输入无效时返回 undefined。
 */
export function normalizePageSize(value: unknown): number | undefined {
  const pageSize = Math.floor(Number(value))

  return Number.isFinite(pageSize) && pageSize >= 1 ? pageSize : undefined
}
