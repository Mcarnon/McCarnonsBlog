import { useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { buildArchiveGroups } from './archive'

/**
 * 提供归档页所需的文章分组状态。
 *
 * @returns 响应式归档分组与公开文章总数。
 */
export function useArchiveGroups() {
  const site = useSiteStore()

  const groups = computed(() => buildArchiveGroups(site.postList ?? []))
  const totalPosts = computed(() => groups.value.reduce((total, group) => total + group.count, 0))

  return {
    groups,
    totalPosts,
  }
}
