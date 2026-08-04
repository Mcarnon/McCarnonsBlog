import type { Post } from 'valaxy'
import { normalizePostTitle, resolvePostTimestamp } from './post-content'

/**
 * 判断文章是否可出现在公开列表中。
 *
 * @param post - 待检查的 Valaxy 文章。
 * @returns 文章有路径且未显式隐藏时返回 `true`。
 */
export function isVisiblePost(post: Post) {
  return Boolean(post.path) && post.hide !== true
}

/**
 * 过滤隐藏文章并按更新时间或发布时间倒序排列。
 *
 * @param posts - 待处理的只读文章列表。
 * @returns 不修改原列表的公开文章排序副本。
 */
export function getVisibleSortedPosts(posts: readonly Post[]) {
  return posts
    .filter(isVisiblePost)
    .slice()
    .sort((left, right) => resolvePostTimestamp(right) - resolvePostTimestamp(left))
}

/**
 * 将 Valaxy 原始文章转换为聚合视图通用条目。
 *
 * @param post - 待转换的 Valaxy 文章。
 * @returns 包含路径、归一化标题和展示日期的聚合条目。
 */
export function createPostEntry(post: Post) {
  return {
    path: String(post.path),
    title: normalizePostTitle(post.title),
    date: post.date ?? post.updated,
  }
}
