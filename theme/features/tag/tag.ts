import type { Post } from 'valaxy'
import type { TagEntry, TagGroup } from './types'
import { hashString } from '../../shared/utils'
import { createPostEntry, getVisibleSortedPosts, resolvePostTimestamp } from '../post'

/** 标签聚合构建阶段使用的可变分组。 */
interface MutableTagGroup {
  id: string
  name: string
  entries: TagEntry[]
}

/** 标签名称与文章条目的中间关联结构。 */
interface TaggedEntry {
  tag: string
  entry: TagEntry
}

/**
 * 将 frontmatter 中的标签字段归一化为去重后的标签数组。
 *
 * @param tags - 待归一化的标签字段。
 * @returns 去除空白、空值和重复项后的标签列表。
 */
export function normalizeTags(tags: unknown) {
  if (Array.isArray(tags))
    return Array.from(new Set(tags.map(tag => String(tag).trim()).filter(Boolean)))

  if (typeof tags === 'string' && tags.trim())
    return [tags.trim()]

  return []
}

/**
 * 为标签生成稳定且可读的 DOM id。
 *
 * @param name - 标签名称。
 * @returns 由可读片段和稳定哈希组成的标签 ID。
 */
export function createTagId(name: string) {
  // 可读片段便于调试，哈希片段用于兜住中文或特殊字符归一化后的碰撞。
  const readable = encodeURIComponent(name)
    .replace(/%/g, '')
    .replace(/[^\w-]/g, '-')
  const hash = hashString(name).toString(36)

  return `tag-${readable}-${hash}`
}

/**
 * 按文章日期倒序排列标签下的文章条目。
 *
 * @param left - 左侧文章条目。
 * @param right - 右侧文章条目。
 * @returns 适用于数组排序的比较结果。
 */
function compareEntries(left: TagEntry, right: TagEntry) {
  const leftTimestamp = resolvePostTimestamp({ date: left.date, updated: undefined })
  const rightTimestamp = resolvePostTimestamp({ date: right.date, updated: undefined })

  return rightTimestamp - leftTimestamp || left.title.localeCompare(right.title)
}

/**
 * 按文章数和标签名稳定排序标签组。
 *
 * @param left - 左侧标签组。
 * @param right - 右侧标签组。
 * @returns 适用于数组排序的比较结果。
 */
function compareGroups(left: TagGroup, right: TagGroup) {
  return right.count - left.count || left.name.localeCompare(right.name)
}

/**
 * 为文章创建去重后的标签关联条目。
 *
 * @param post - 待转换的 Valaxy 文章。
 * @returns 每个标签对应一项的标签文章关联列表。
 */
function createTaggedEntries(post: Post): TaggedEntry[] {
  const entry = createPostEntry(post)

  return normalizeTags(post.tags).map(tag => ({ tag, entry }))
}

/**
 * 将标签文章关联追加到对应标签分组，并返回新的映射。
 *
 * @param mapped - 已构建的标签分组映射。
 * @param taggedEntry - 待追加的标签文章关联。
 * @returns 包含当前关联的新标签分组映射。
 */
function appendTaggedEntry(mapped: Map<string, MutableTagGroup>, taggedEntry: TaggedEntry) {
  const { tag, entry } = taggedEntry
  const existing = mapped.get(tag)
  const nextGroup: MutableTagGroup = existing
    ? {
        ...existing,
        entries: [...existing.entries, entry],
      }
    : {
        id: createTagId(tag),
        name: tag,
        entries: [entry],
      }

  return new Map(mapped).set(tag, nextGroup)
}

/**
 * 将可变标签分组转换为 UI 消费的标签组。
 *
 * @param group - 待固化的可变标签分组。
 * @returns 包含文章数量和稳定排序条目的标签组。
 */
function finalizeTagGroup(group: MutableTagGroup): TagGroup {
  return {
    id: group.id,
    name: group.name,
    count: group.entries.length,
    entries: group.entries.slice().sort(compareEntries),
  }
}

/**
 * 从文章列表构建标签聚合数据。
 *
 * @param sourcePosts - 待聚合的只读文章列表。
 * @returns 按文章数和标签名稳定排序的标签组。
 */
export function buildTagGroups(sourcePosts: readonly Post[]) {
  return Array.from(
    getVisibleSortedPosts(sourcePosts)
      .flatMap(createTaggedEntries)
      .reduce(appendTaggedEntry, new Map<string, MutableTagGroup>())
      .values(),
  )
    .map(finalizeTagGroup)
    .sort(compareGroups)
}

/**
 * 统计拥有至少一个标签的文章数量。
 *
 * @param groups - 待统计的标签分组。
 * @returns 按文章路径去重后的文章数量。
 */
export function countTaggedPosts(groups: readonly TagGroup[]) {
  // 一篇文章可拥有多个标签，统计文章总数时必须按路径去重。
  return new Set(groups.flatMap(group => group.entries.map(entry => entry.path))).size
}
