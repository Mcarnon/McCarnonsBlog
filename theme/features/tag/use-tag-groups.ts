import { useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { buildTagGroups, countTaggedPosts } from './tag'

/**
 * 提供标签页所需的标签分组和统计信息。
 *
 * @returns 响应式标签分组、带标签文章总数与标签总数。
 */
export function useTagGroups() {
  const site = useSiteStore()

  const groups = computed(() => buildTagGroups(site.postList ?? []))
  const totalTags = computed(() => groups.value.length)
  const totalPosts = computed(() => countTaggedPosts(groups.value))

  return {
    groups,
    totalPosts,
    totalTags,
  }
}
