import type { Post } from 'valaxy'
import type { CategoryEntry, CategoryNode } from './types'
import { createPostEntry, getVisibleSortedPosts, resolvePostTimestamp } from '../post'

/** 不参与真实分类计数且需要固定置后的兜底分类名称。 */
const UNCATEGORIZED_CATEGORY_NAMES = new Set(['Uncategorized', '未分类'])

/** 分类树构建阶段使用的可变节点。 */
interface MutableCategoryNode {
  name: string
  segments: string[]
  total: number
  entries: CategoryEntry[]
  children: Map<string, MutableCategoryNode>
}

/** 分类路径归约过程中的当前节点状态。 */
interface CategoryPathState {
  current: MutableCategoryNode
}

/**
 * 判断分类名称是否属于未分类兜底项。
 *
 * @param name - 待判断的分类名称。
 * @returns 名称属于约定的未分类名称时返回 `true`。
 */
function isUncategorizedCategoryName(name: string) {
  return UNCATEGORIZED_CATEGORY_NAMES.has(name.trim())
}

/**
 * 判断分类节点是否应计入真实分类数量。
 *
 * @param node - 待判断的分类节点。
 * @returns 非未分类节点返回 `true`。
 */
function isCountableCategoryNode(node: CategoryNode) {
  return !isUncategorizedCategoryName(node.name)
}

/**
 * 获取分类节点的排序分桶，确保未分类节点固定置后。
 *
 * @param node - 待分桶的分类节点。
 * @returns 真实分类返回 `0`，未分类返回 `1`。
 */
function getCategorySortBucket(node: CategoryNode) {
  // 未分类只是兜底分组，不参与真实分类竞争，排序时固定放到最后。
  return isCountableCategoryNode(node) ? 0 : 1
}

/**
 * 将 frontmatter 中的分类字段解析为分类树路径段。
 *
 * @param categories - Valaxy 文章的分类字段。
 * @returns 非空分类路径段；没有有效分类时返回未分类路径。
 */
export function normalizeCategorySegments(categories: Post['categories']) {
  if (Array.isArray(categories)) {
    // 数组分类按层级段处理，保持和 "A/B/C" 字符串分类一致的树语义。
    const segments = categories
      .map(category => String(category).trim())
      .filter(Boolean)

    return segments.length ? segments : ['Uncategorized']
  }

  if (typeof categories === 'string' && categories.trim()) {
    const segments = categories
      .split('/')
      .map(category => category.trim())
      .filter(Boolean)

    return segments.length ? segments : ['Uncategorized']
  }

  return ['Uncategorized']
}

/**
 * 创建分类树构建阶段使用的可变节点。
 *
 * @param name - 当前节点名称。
 * @param segments - 从根节点到当前节点的路径段。
 * @returns 初始化后的可变分类节点。
 */
function createCategoryNode(name: string, segments: string[]): MutableCategoryNode {
  return {
    name,
    segments,
    total: 0,
    entries: [],
    children: new Map(),
  }
}

/**
 * 按未分类分桶、文章数、子分类数和路径名稳定排序分类节点。
 *
 * @param left - 左侧分类节点。
 * @param right - 右侧分类节点。
 * @returns 适用于数组排序的比较结果。
 */
function compareNodes(left: CategoryNode, right: CategoryNode) {
  return getCategorySortBucket(left) - getCategorySortBucket(right)
    || right.total - left.total
    || right.childCount - left.childCount
    || left.fullPath.localeCompare(right.fullPath)
}

/**
 * 按文章日期倒序排列分类下的文章条目。
 *
 * @param left - 左侧文章条目。
 * @param right - 右侧文章条目。
 * @returns 适用于数组排序的比较结果。
 */
function compareEntries(left: CategoryEntry, right: CategoryEntry) {
  const leftTimestamp = resolvePostTimestamp({ date: left.date, updated: undefined })
  const rightTimestamp = resolvePostTimestamp({ date: right.date, updated: undefined })

  return rightTimestamp - leftTimestamp || left.title.localeCompare(right.title)
}

/**
 * 获取父节点下的已有子节点，或创建并挂载新子节点。
 *
 * @param parent - 父级可变分类节点。
 * @param name - 子节点名称。
 * @param segments - 子节点完整路径段。
 * @returns 已存在或新创建的子节点。
 */
function getOrCreateCategoryChild(parent: MutableCategoryNode, name: string, segments: string[]) {
  const existing = parent.children.get(name)
  if (existing)
    return existing

  const next = createCategoryNode(name, segments)
  parent.children.set(name, next)
  return next
}

/**
 * 将文章沿分类路径追加到树中，并累计各层文章数量。
 *
 * @param root - 分类树根节点。
 * @param post - 待追加的 Valaxy 文章。
 * @returns 已完成当前文章追加的根节点。
 */
function appendCategoryPath(root: MutableCategoryNode, post: Post) {
  const segments = normalizeCategorySegments(post.categories)
  const entry = createPostEntry(post)
  const { current } = segments.reduce<CategoryPathState>((state, segment, index) => {
    const nextSegments = segments.slice(0, index + 1)
    const next = getOrCreateCategoryChild(state.current, segment, nextSegments)

    // 每一层都累计文章数，父级 total 表示该分类树下的文章总量。
    next.total += 1

    return {
      ...state,
      current: next,
    }
  }, { current: root })

  current.entries = [...current.entries, entry]
  return root
}

/**
 * 将构建阶段的可变节点转换为 UI 消费的只读树节点结构。
 *
 * @param node - 待固化的可变分类节点。
 * @returns 完成子节点和文章稳定排序的分类树节点。
 */
function finalizeCategoryNode(node: MutableCategoryNode): CategoryNode {
  const children = Array.from(node.children.values())
    .map(finalizeCategoryNode)
    .sort(compareNodes)

  return {
    name: node.name,
    fullPath: node.segments.join('/'),
    parentPath: node.segments.slice(0, -1).join(' / '),
    depth: Math.max(node.segments.length - 1, 0),
    total: node.total,
    childCount: children.filter(isCountableCategoryNode).length,
    entries: node.entries.slice().sort(compareEntries),
    children,
  }
}

/**
 * 递归统计分类树中的真实分类节点总数。
 *
 * @param nodes - 待统计的分类树节点。
 * @returns 排除未分类兜底节点后的节点总数。
 */
export function countCategoryNodes(nodes: CategoryNode[]): number {
  return nodes.reduce((total, node) => {
    const currentCount = isCountableCategoryNode(node) ? 1 : 0
    return total + currentCount + countCategoryNodes(node.children)
  }, 0)
}

/**
 * 从文章列表构建分类树。
 *
 * @param sourcePosts - 待聚合的只读文章列表。
 * @returns 完成计数和稳定排序的顶层分类节点。
 */
export function buildCategoryTree(sourcePosts: readonly Post[]) {
  const root = getVisibleSortedPosts(sourcePosts)
    .reduce(appendCategoryPath, createCategoryNode('All', []))

  return Array.from(root.children.values())
    .map(finalizeCategoryNode)
    .sort(compareNodes)
}
