import type { LmSearchHighlightPart } from './types'

/**
 * 将搜索索引中的多形态文案解析为可展示字符串。
 *
 * @param value - 待解析的索引字段。
 * @returns 去除首尾空白后的可展示文本；无法解析时返回空字符串。
 */
export function resolveSearchText(value: unknown): string {
  if (typeof value === 'string')
    return value.trim()

  if (value && typeof value === 'object') {
    // Valaxy 标题可能是多语言对象，搜索列表只需要拿到第一个可读文案。
    const resolved: string | undefined = Object.values(value as Record<string, unknown>)
      .map(resolveSearchText)
      .find(Boolean)

    return resolved ?? ''
  }

  return ''
}

/**
 * 移除搜索摘要中的 HTML 标签并压缩空白。
 *
 * @param value - 待清理的摘要文本。
 * @returns 不含 HTML 标签且空白规范化后的摘要。
 */
export function stripSearchHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 从指定文本起点向后收集单个查询词的非重叠命中区间。
 *
 * 匹配基于调用方传入的小写文本执行；每次命中后从当前词尾继续搜索，
 * 因此同一查询词的区间保持由前向后且互不重叠。
 *
 * @param lowerText - 已转换为小写的目标文本。
 * @param lowerTerm - 已转换为小写的查询词。
 * @param termLength - 查询词在原始输入中的字符长度。
 * @returns 包含起止下标的闭区间列表。
 */
function collectTermRanges(
  lowerText: string,
  lowerTerm: string,
  termLength: number,
): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  let fromIndex = 0

  while (fromIndex < lowerText.length) {
    const start = lowerText.indexOf(lowerTerm, fromIndex)
    if (start === -1)
      break

    ranges.push([start, start + termLength - 1])
    fromIndex = start + termLength
  }

  return ranges
}

/**
 * 收集各查询词在目标文本中的大小写无关命中区间。
 *
 * @param text - 待匹配的展示文本。
 * @param search - 可包含多个空白分隔词的查询内容。
 * @returns 各查询词独立匹配得到的命中闭区间。
 */
export function collectQueryRanges(text: string, search: string) {
  // 高亮按用户输入的每个词独立匹配，和 Fuse 的模糊得分保持解耦。
  const terms = search
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  const lowerText = text.toLowerCase()

  return terms.flatMap((term) => {
    return collectTermRanges(lowerText, term.toLowerCase(), term.length)
  })
}

/**
 * 合并重叠或相邻的高亮区间。
 *
 * @param ranges - 待合并的命中闭区间。
 * @param maxLength - 目标文本长度，用于裁剪越界下标。
 * @returns 已排序且互不重叠的有效闭区间。
 */
export function mergeRanges(ranges: readonly (readonly [number, number])[], maxLength: number) {
  // 重叠或相邻的命中区间合并后再渲染，避免连续 mark 被拆成碎片。
  const normalizedRanges = ranges
    .map(([start, end]) => [Math.max(0, start), Math.min(maxLength - 1, end)] as const)
    .filter(([start, end]) => start <= end)
    .sort((a, b) => a[0] - b[0])

  return normalizedRanges.reduce<Array<[number, number]>>((mergedRanges, [start, end]) => {
    const lastRange = mergedRanges[mergedRanges.length - 1]

    if (!lastRange || start > lastRange[1] + 1)
      return [...mergedRanges, [start, end]]

    return [
      ...mergedRanges.slice(0, -1),
      [lastRange[0], Math.max(lastRange[1], end)],
    ]
  }, [])
}

/** UI 高亮分片归并过程中的游标与已生成分片。 */
interface HighlightPartState {
  cursor: number
  parts: LmSearchHighlightPart[]
}

/**
 * 将文本和高亮区间转换为 UI 可直接渲染的分片。
 *
 * @param text - 待分片的展示文本。
 * @param ranges - 文本中的高亮闭区间。
 * @returns 按原文本顺序排列的普通与高亮文本分片。
 */
export function createHighlightParts(
  text: string,
  ranges: readonly (readonly [number, number])[],
): LmSearchHighlightPart[] {
  if (!text)
    return []

  const mergedRanges = mergeRanges(ranges, text.length)
  if (!mergedRanges.length)
    return [{ text, highlighted: false }]

  const { cursor, parts } = mergedRanges.reduce<HighlightPartState>((state, [start, end]) => {
    const plainPart = state.cursor < start
      ? [{ text: text.slice(state.cursor, start), highlighted: false }]
      : []

    return {
      cursor: end + 1,
      parts: [
        ...state.parts,
        ...plainPart,
        { text: text.slice(start, end + 1), highlighted: true },
      ],
    }
  }, { cursor: 0, parts: [] })

  if (cursor >= text.length)
    return parts

  return [
    ...parts,
    { text: text.slice(cursor), highlighted: false },
  ]
}
