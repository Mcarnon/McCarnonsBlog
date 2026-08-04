import type { TagCloudRow, TagCloudSourceItem, TagCloudViewItem } from './types'
import { clamp, hashString } from '../../shared/utils'

/**
 * 在两个数值之间按比例插值。
 *
 * @param min - 插值区间最小值。
 * @param max - 插值区间最大值。
 * @param ratio - 区间内的插值比例。
 * @returns 按比例计算出的数值。
 */
function interpolate(min: number, max: number, ratio: number) {
  return min + (max - min) * ratio
}

/**
 * 将标签文章数映射为 0 到 1 的视觉权重。
 *
 * @param count - 当前标签文章数。
 * @param min - 所有标签中的最小文章数。
 * @param range - 最大与最小文章数的差值。
 * @returns 限制在 0 到 1 之间的视觉权重。
 */
function resolveWeightRatio(count: number, min: number, range: number) {
  if (range <= 0)
    return 0.55

  return clamp((count - min) / range, 0, 1)
}

/**
 * 按权重和稳定哈希排序标签云项。
 *
 * @param left - 左侧标签云项。
 * @param right - 右侧标签云项。
 * @returns 适用于数组排序的比较结果。
 */
function compareCloudItems(left: TagCloudViewItem, right: TagCloudViewItem) {
  return right.count - left.count || hashString(left.name) - hashString(right.name)
}

/**
 * 根据标签数量决定标签云行数，避免少量标签被过度拆散。
 *
 * @param count - 标签云项数量。
 * @returns 一到五之间的布局行数。
 */
function resolveRowCount(count: number) {
  if (count <= 1)
    return 1

  if (count <= 4)
    return 2

  if (count <= 9)
    return 3

  if (count <= 18)
    return 4

  return 5
}

/**
 * 生成从中间向外填充的行序列，让标签云视觉重心更稳定。
 *
 * @param rowCount - 标签云总行数。
 * @returns 从中间行向外扩散且不重复的行索引。
 */
function createRowSequence(rowCount: number) {
  const center = Math.floor(rowCount / 2)
  const offsets = Array.from({ length: rowCount }, (_, index) => index + 1)
  const outwardRows = offsets.flatMap(offset => [center - offset, center + offset])

  return [center, ...outwardRows]
    .filter(rowIndex => rowIndex >= 0 && rowIndex < rowCount)
    .slice(0, rowCount)
}

/**
 * 将每行权重最高的标签移动到视觉中心附近。
 *
 * @param items - 同一行中的标签云项。
 * @returns 将最强标签置于中间位置的新数组。
 */
function moveStrongestItemToCenter(items: TagCloudViewItem[]) {
  if (items.length < 3)
    return items

  const strongestIndex = items.reduce((resolvedIndex, item, index) => {
    return item.count > items[resolvedIndex].count ? index : resolvedIndex
  }, 0)
  const strongestItem = items[strongestIndex]
  const remainingItems = items.filter((_, index) => index !== strongestIndex)
  const targetIndex = Math.floor(remainingItems.length / 2)

  return [
    ...remainingItems.slice(0, targetIndex),
    strongestItem,
    ...remainingItems.slice(targetIndex),
  ]
}

/**
 * 将标签统计项转换为带稳定视觉参数的标签云项。
 *
 * @param item - 待转换的标签统计项。
 * @param min - 所有标签中的最小文章数。
 * @param range - 最大与最小文章数的差值。
 * @returns 包含字号、字重、透明度与偏移量的标签云项。
 */
function createTagCloudViewItem(item: TagCloudSourceItem, min: number, range: number): TagCloudViewItem {
  const ratio = resolveWeightRatio(item.count, min, range)
  const hash = hashString(item.name)
  const shiftX = ((hash % 9) - 4) / 10
  const shiftY = (((hash >> 4) % 7) - 3) / 10

  return {
    ...item,
    fontSize: `${interpolate(0.95, 2.35, ratio).toFixed(2)}rem`,
    fontWeight: Math.round(interpolate(600, 900, ratio)),
    opacity: interpolate(0.66, 1, ratio),
    shiftX: `${shiftX.toFixed(2)}rem`,
    shiftY: `${shiftY.toFixed(2)}rem`,
  }
}

/**
 * 将标签统计数据转换为标签云布局行。
 *
 * @param sourceItems - 待布局的只读标签统计项。
 * @returns 具有稳定行 ID 和视觉参数的标签云布局行。
 */
export function buildTagCloudRows(sourceItems: readonly TagCloudSourceItem[]): TagCloudRow[] {
  if (!sourceItems.length)
    return []

  const counts = sourceItems.map(item => item.count)
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  const range = max - min

  const viewItems = sourceItems
    .map(item => createTagCloudViewItem(item, min, range))
    .sort(compareCloudItems)

  const rowCount = resolveRowCount(viewItems.length)
  const rowSequence = createRowSequence(rowCount)
  const rows = viewItems.reduce<TagCloudViewItem[][]>((nextRows, item, index) => {
    const rowIndex = rowSequence[index % rowSequence.length]

    return nextRows.map((row, currentIndex) => {
      return currentIndex === rowIndex ? [...row, item] : row
    })
  }, Array.from({ length: rowCount }, () => []))

  return rows
    .map((row, index) => ({
      id: `tag-cloud-row-${index}`,
      items: moveStrongestItemToCenter(row),
    }))
    .filter(row => row.items.length)
}
