import type { MaybeRefOrGetter } from 'vue'
import type { TagCloudSourceItem } from './types'
import { computed, toValue } from 'vue'
import { buildTagCloudRows } from './tag-cloud'

/**
 * 将标签统计数据包装为响应式标签云布局。
 *
 * @param items - 标签统计数组、响应式引用或获取函数。
 * @returns 随输入变化重新计算的标签云布局行。
 */
export function useTagCloud(items: MaybeRefOrGetter<TagCloudSourceItem[]>) {
  return computed(() => buildTagCloudRows(toValue(items)))
}
