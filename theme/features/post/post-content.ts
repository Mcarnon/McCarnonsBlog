import type { Post } from 'valaxy'

/** 匹配摘要中的 HTML 标签，用于生成文章卡片纯文本。 */
const HTML_TAG_REGEX = /<[^>]+>/g

/** 匹配连续空白字符，用于统一文章摘要的展示间距。 */
const WHITESPACE_REGEX = /\s+/g

/**
 * 将文章摘要归一化为列表卡片可直接展示的纯文本。
 *
 * @param raw - 待处理的原始摘要。
 * @param maxLength - 最多保留的字符数。
 * @returns 去除标签、合并空白并截断后的摘要。
 */
export function normalizeExcerpt(raw: string, maxLength = 140) {
  return String(raw)
    .replace(HTML_TAG_REGEX, '')
    .replace(WHITESPACE_REGEX, ' ')
    .trim()
    .slice(0, maxLength)
}

/**
 * 将 Valaxy 文章标题归一化为聚合页面可用的兜底文案。
 *
 * @param title - Valaxy 文章标题，允许字符串或多语言对象。
 * @returns 可展示的标题；无有效内容时返回 `Untitled`。
 */
export function normalizePostTitle(title: Post['title']) {
  if (typeof title === 'string')
    return title.trim() || 'Untitled'

  if (title && typeof title === 'object') {
    // 多语言标题优先取第一个非空值，列表页不在这里绑定具体 locale。
    const resolved = Object.values(title).find(value => String(value).trim())
    if (resolved)
      return String(resolved).trim()
  }

  return 'Untitled'
}

/**
 * 解析文章排序用时间戳，无法解析时返回零以保持稳定排序。
 *
 * @param post - 只包含发布日期和更新时间的文章数据。
 * @returns 优先发布日期的毫秒时间戳，日期无效时返回零。
 */
export function resolvePostTimestamp(post: Pick<Post, 'date' | 'updated'>) {
  const timestamp = new Date(post.date ?? post.updated ?? 0).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}
