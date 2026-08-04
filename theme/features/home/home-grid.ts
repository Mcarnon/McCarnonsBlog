/** 首页卡片宽度的默认像素回退值。 */
const DEFAULT_LENGTH_PX = 288

/** `rem` 长度换算使用的默认根字体像素值。 */
const DEFAULT_ROOT_FONT_SIZE_PX = 16

/** 首页网格支持的最小列数。 */
const MIN_GRID_COLUMNS = 1

/** 首页网格支持的最大列数。 */
const MAX_GRID_COLUMNS = 6

/** 匹配大于 0 的 px、rem 或无单位十进制长度；其他格式交由长度解析函数回退。 */
const WIDTH_REGEX = /^((?=[\d.]*[1-9])(?:\d+(?:\.\d+)?|\.\d+))(px|rem)?$/i

/**
 * 将配置列数规范到首页网格支持的 1 至 6 列范围。
 *
 * @param value - 待解析的列数；非有限数字回退为 1。
 * @returns 向下取整并限制在 1 至 6 之间的列数。
 */
export function clampColumnCount(value: unknown) {
  const count = Number(value)

  if (!Number.isFinite(count))
    return MIN_GRID_COLUMNS

  return Math.min(MAX_GRID_COLUMNS, Math.max(MIN_GRID_COLUMNS, Math.floor(count)))
}

/**
 * 将首页卡片宽度配置换算为像素值。
 *
 * 仅支持大于 0 的有限数字、`px`、`rem` 与无单位十进制长度；无单位按 `px` 处理。
 * 非法输入回退到规范后的回退值，非法回退值与根字体大小分别使用 288 和 16。
 *
 * @param value - 待换算的数字或字符串长度。
 * @param fallback - 输入非法时采用的正有限像素回退值，默认为 288。
 * @param rootFontSize - `rem` 换算使用的正有限根字体像素值，默认为 16。
 * @returns 大于 0 的有限像素值。
 */
export function resolveLengthToPx(
  value: number | string | undefined,
  fallback = DEFAULT_LENGTH_PX,
  rootFontSize = DEFAULT_ROOT_FONT_SIZE_PX,
) {
  const safeFallback = Number.isFinite(fallback) && fallback > 0 ? fallback : DEFAULT_LENGTH_PX
  const safeRootFontSize = Number.isFinite(rootFontSize) && rootFontSize > 0
    ? rootFontSize
    : DEFAULT_ROOT_FONT_SIZE_PX

  if (typeof value === 'number' && Number.isFinite(value) && value > 0)
    return value

  const raw = String(value ?? '').trim()
  const match = raw.match(WIDTH_REGEX)

  if (!match)
    return safeFallback

  const amount = Number(match[1])
  const unit = (match[2] ?? 'px').toLowerCase()
  const pixels = unit === 'rem' ? amount * safeRootFontSize : amount

  return Number.isFinite(pixels) && pixels > 0 ? pixels : safeFallback
}

/**
 * 根据容器宽度、卡片最小宽度与间距计算首页网格实际列数。
 *
 * @param containerWidth - 网格容器的正有限可用像素宽度；非法时回退为 1 列。
 * @param minCardWidthPx - 单张卡片允许的正有限最小像素宽度；非法时回退为 1 列。
 * @param maxColumns - 配置允许的最大列数，函数内部会限制到 1 至 6。
 * @param gapPx - 相邻卡片之间的像素间距；仅接受非负有限数，非法时按 0 处理。
 * @returns 有限且位于 1 至规范化最大列数之间的实际列数。
 */
export function resolveGridColumnCount(
  containerWidth: number,
  minCardWidthPx: number,
  maxColumns: number,
  gapPx: number,
) {
  if (
    !Number.isFinite(containerWidth)
    || containerWidth <= 0
    || !Number.isFinite(minCardWidthPx)
    || minCardWidthPx <= 0
  ) {
    return MIN_GRID_COLUMNS
  }

  const safeMaxColumns = clampColumnCount(maxColumns)
  const safeGapPx = Number.isFinite(gapPx) && gapPx >= 0 ? gapPx : 0
  const fittedColumns = Math.floor((containerWidth + safeGapPx) / (minCardWidthPx + safeGapPx))

  if (!Number.isFinite(fittedColumns))
    return fittedColumns === Number.POSITIVE_INFINITY ? safeMaxColumns : MIN_GRID_COLUMNS

  return Math.min(safeMaxColumns, Math.max(MIN_GRID_COLUMNS, fittedColumns))
}
