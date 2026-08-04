/**
 * 分类树中的文章条目。
 */
export interface CategoryEntry {
  path: string
  title: string
  date?: string | number | Date
}

/**
 * 分类页树节点，包含当前分类层级、子分类与直属文章。
 */
export interface CategoryNode {
  name: string
  fullPath: string
  parentPath: string
  depth: number
  total: number
  childCount: number
  entries: CategoryEntry[]
  children: CategoryNode[]
}
