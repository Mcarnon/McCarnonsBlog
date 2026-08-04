/**
 * 递归解析 Frontmatter 文本，并限制循环检测范围为当前递归路径。
 *
 * @remarks
 * 对象进入当前路径时加入 `seen`，离开时在 `finally` 中移除；遇到循环引用时
 * 返回本层兜底值。对象候选按属性顺序逐个解析，找到首个可读值后立即短路。
 *
 * @param value - 当前待解析的值。
 * @param fallback - 当前层没有可读文本时使用的兜底字符串。
 * @param seen - 当前递归路径中已经访问的对象集合。
 * @returns 当前层解析出的首个可读文本或兜底字符串。
 */
function resolveFrontmatterTextInternal(value: unknown, fallback: string, seen: WeakSet<object>): string {
  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized || fallback
  }

  if (typeof value === 'number')
    return String(value)

  if (value && typeof value === 'object') {
    if (seen.has(value))
      return fallback

    seen.add(value)

    try {
      for (const candidate of Object.values(value as Record<string, unknown>)) {
        const resolved = resolveFrontmatterTextInternal(candidate, '', seen)
        if (resolved)
          return resolved
      }

      return fallback
    }
    finally {
      seen.delete(value)
    }
  }

  return fallback
}

/**
 * 将 Frontmatter 文本字段解析为可展示字符串。
 *
 * @remarks
 * 字符串会去除首尾空白，数字会转换为字符串；多语言对象按属性顺序递归查找
 * 首个可读的非空值。所有候选均不可读时返回 `fallback`。
 *
 * @param value - 字符串、数字、多语言对象或其他待解析值。
 * @param fallback - 没有可读文本时使用的兜底字符串。
 * @returns 解析出的首个可读文本或兜底字符串。
 */
export function resolveFrontmatterText(value: unknown, fallback = ''): string {
  return resolveFrontmatterTextInternal(value, fallback, new WeakSet<object>())
}

/**
 * 按主题约定解析 Frontmatter 中的文章封面地址。
 *
 * @remarks
 * 解析顺序固定为 `cover`、字符串形式的 `image`、`image` 数组中的首个非空字符串，
 * 最后是对象形式的 `image.url`；均不可用时返回空字符串。
 *
 * @param frontmatter - 文章 Frontmatter 数据，允许为空。
 * @returns 按优先级解析出的封面地址，未找到时返回空字符串。
 */
export function resolveFrontmatterCover(frontmatter: Record<string, unknown> | null | undefined): string {
  const data: Record<string, unknown> = frontmatter ?? {}
  const postCover = data.cover

  if (typeof postCover === 'string' && postCover)
    return postCover

  const image = data.image

  if (typeof image === 'string' && image)
    return image

  if (Array.isArray(image)) {
    const firstString = image.find(item => typeof item === 'string' && item)
    if (typeof firstString === 'string')
      return firstString
  }

  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string')
    return image.url

  return ''
}
