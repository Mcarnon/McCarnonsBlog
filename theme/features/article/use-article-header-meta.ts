import { formatDate, useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { resolveFrontmatterCover, resolveFrontmatterText } from '../../shared/frontmatter'

/** 文章头部附加信息的展示项。 */
interface ArticleInfoItem {
  /** 展示项使用的图标类名。 */
  icon: string
  /** 展示给读者的说明文本。 */
  text: string
}

/**
 * 判断候选值是否为可展示的文章头部信息项。
 *
 * @param item - 由条件表达式生成的信息项候选值。
 * @returns 候选值包含有效信息项时返回 `true`。
 */
function isArticleInfoItem(item: ArticleInfoItem | false | '' | undefined): item is ArticleInfoItem {
  return Boolean(item)
}

/**
 * 解析文章头部展示所需的 Frontmatter 元数据。
 *
 * @remarks
 * 标题与封面遵循主题共享的 Frontmatter 解析规则；分类、标签、日期、字数与
 * 阅读时长保持 Valaxy 原始字段语义，并仅生成存在有效值的附加信息项。
 *
 * @returns 文章 Frontmatter 及供头部组件直接消费的响应式展示数据。
 */
export function useArticleHeaderMeta() {
  const frontmatter = useFrontmatter()

  const title = computed(() => {
    return resolveFrontmatterText(frontmatter.value.title)
  })

  const cover = computed(() => {
    return resolveFrontmatterCover(frontmatter.value)
  })

  const categories = computed(() => {
    const value = frontmatter.value.categories
    return Array.isArray(value) ? value : value ? [value] : []
  })

  const tags = computed(() => {
    const value = frontmatter.value.tags
    return Array.isArray(value) ? value : value ? [value] : []
  })

  const publishedDate = computed(() => {
    return frontmatter.value.date || ''
  })

  const updatedDate = computed(() => {
    const updated = frontmatter.value.updated
    if (!updated)
      return ''

    const nextUpdatedText = formatDate(updated)
    const publishedText = formatDate(publishedDate.value)
    return publishedText !== nextUpdatedText ? nextUpdatedText : ''
  })

  const wordCount = computed(() => {
    return frontmatter.value.wordCount
  })

  const readingTime = computed(() => {
    const value = frontmatter.value.readingTime
    return typeof value === 'number' && value > 0 ? value : 0
  })

  const infoItems = computed<ArticleInfoItem[]>(() => {
    return [
      updatedDate.value && {
        icon: 'i-ri-history-line',
        text: `更新于 ${updatedDate.value}`,
      },
      wordCount.value && {
        icon: 'i-ri-file-text-line',
        text: `本文字数: ${wordCount.value}`,
      },
      readingTime.value > 0 && {
        icon: 'i-ri-book-open-line',
        text: `阅读时长: ${readingTime.value}m`,
      },
    ].filter(isArticleInfoItem)
  })

  return {
    frontmatter,
    title,
    cover,
    categories,
    tags,
    publishedDate,
    updatedDate,
    wordCount,
    readingTime,
    infoItems,
  }
}
