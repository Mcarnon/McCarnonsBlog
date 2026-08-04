import type { Post } from 'valaxy'
import type { ArchiveEntry, ArchiveGroup } from './types'
import { createPostEntry, getVisibleSortedPosts, resolvePostTimestamp } from '../post'

/**
 * 将文章分类归一化为归档条目的扁平分类列表。
 *
 * @param categories - Valaxy 文章的分类字段。
 * @returns 去除空值和首尾空白后的分类列表。
 */
export function normalizeArchiveCategories(categories: Post['categories']) {
  if (Array.isArray(categories))
    return categories.filter(Boolean).map(category => String(category).trim()).filter(Boolean)

  if (typeof categories === 'string' && categories.trim())
    return [categories.trim()]

  return []
}

/**
 * 解析文章归档年份，无日期文章归入 Unknown。
 *
 * @param post - 待解析的 Valaxy 文章。
 * @returns 四位年份字符串，缺少有效时间时返回 `Unknown`。
 */
export function resolveArchiveYear(post: Post) {
  const timestamp = resolvePostTimestamp(post)
  // 无日期文章仍保留在归档中，但排序时固定落到最后。
  if (!timestamp)
    return 'Unknown'

  return String(new Date(timestamp).getFullYear())
}

/**
 * 将 Valaxy 文章转换为归档页条目。
 *
 * @param post - 待转换的 Valaxy 文章。
 * @returns 包含归一化分类的归档条目。
 */
function createArchiveEntry(post: Post): ArchiveEntry {
  return {
    ...createPostEntry(post),
    categories: normalizeArchiveCategories(post.categories),
  }
}

/**
 * 将文章追加到对应年份的归档分组，并返回新的映射。
 *
 * @param mapped - 已构建的年份分组映射。
 * @param post - 待追加的 Valaxy 文章。
 * @returns 包含当前文章的新年份分组映射。
 */
function appendArchiveGroup(mapped: Map<string, ArchiveGroup>, post: Post) {
  const year = resolveArchiveYear(post)
  const existingGroup = mapped.get(year)
  const entry = createArchiveEntry(post)
  const nextGroup: ArchiveGroup = existingGroup
    ? {
        ...existingGroup,
        count: existingGroup.count + 1,
        entries: [...existingGroup.entries, entry],
      }
    : {
        year,
        sortKey: year === 'Unknown' ? Number.NEGATIVE_INFINITY : Number(year),
        count: 1,
        entries: [entry],
      }

  return new Map(mapped).set(year, nextGroup)
}

/**
 * 从文章列表构建按年份分组的归档数据。
 *
 * @param sourcePosts - 待聚合的只读文章列表。
 * @returns 按年份倒序排列且将 Unknown 固定置后的归档分组。
 */
export function buildArchiveGroups(sourcePosts: readonly Post[]) {
  return Array.from(
    getVisibleSortedPosts(sourcePosts)
      .reduce(appendArchiveGroup, new Map<string, ArchiveGroup>())
      .values(),
  ).sort((left, right) => right.sortKey - left.sortKey)
}
