/**
 * Valaxy Fuse 索引中的原始搜索项。
 */
export interface LmFuseSearchItem {
  title: string | Record<string, string>
  excerpt?: string
  author: string
  tags: string[]
  categories: string[]
  link: string
  content?: string
}

/**
 * 搜索结果中一段可渲染文本，`highlighted` 标记是否命中查询词。
 */
export interface LmSearchHighlightPart {
  text: string
  highlighted: boolean
}

/**
 * 搜索 UI 直接消费的归一化结果。
 */
export interface LmFuseSearchResult {
  id: string
  title: string
  titleParts: LmSearchHighlightPart[]
  excerpt: string
  excerptParts: LmSearchHighlightPart[]
  tags: string[]
  categories: string[]
  score?: number
}
