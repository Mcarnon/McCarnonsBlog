import { useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { buildCategoryTree, countCategoryNodes } from './category'

/**
 * 提供分类页所需的分类树和统计信息。
 *
 * @returns 响应式分类树、真实分类总数与公开文章总数。
 */
export function useCategoryGroups() {
  const site = useSiteStore()

  const categories = computed(() => buildCategoryTree(site.postList ?? []))
  const totalCategories = computed(() => countCategoryNodes(categories.value))

  /**
   * `buildCategoryTree` 保证每篇可见文章只归入一条分类路径，顶层节点构成互斥且完备的文章分区，因此顶层 total 之和等于公开文章总数。
   */
  const totalPosts = computed(() => categories.value.reduce((total, category) => total + category.total, 0))

  return {
    categories,
    totalCategories,
    totalPosts,
  }
}
