import { hashString } from '../../shared/utils'

/**
 * 在保留 URL 哈希片段的前提下追加查询参数。
 *
 * @param url - 待扩展的原始地址。
 * @param key - 查询参数名。
 * @param value - 查询参数值。
 * @returns 追加编码参数后的地址。
 */
function appendQueryParameter(url: string, key: string, value: string | number) {
  const hashIndex = url.indexOf('#')
  const baseUrl = hashIndex >= 0 ? url.slice(0, hashIndex) : url
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : ''
  const joiner = baseUrl.includes('?') ? '&' : '?'

  return `${baseUrl}${joiner}${encodeURIComponent(key)}=${encodeURIComponent(value)}${hash}`
}

/**
 * 按稳定种子轮转候选列表，使同一文章始终从相同位置开始尝试。
 *
 * @param list - 待轮转的只读候选列表。
 * @param seed - 决定起始位置的稳定种子。
 * @returns 不修改原列表的轮转副本。
 */
export function orderBySeed<T>(list: readonly T[], seed: string) {
  if (!list.length)
    return []

  const startIndex = hashString(seed) % list.length
  return [...list.slice(startIndex), ...list.slice(0, startIndex)]
}

/**
 * 给随机图 API 附加稳定种子，让同一篇文章尽量获得相同封面。
 *
 * @param url - 随机图 API 地址。
 * @param seed - 当前文章的稳定种子。
 * @returns 带有 `lm_seed` 查询参数的地址。
 */
export function appendSeedQuery(url: string, seed: string) {
  return appendQueryParameter(url, 'lm_seed', hashString(seed))
}

/**
 * API 封面重试时改变请求地址，避免浏览器复用失败响应。
 *
 * @param url - 当前 API 封面地址。
 * @param retry - 当前重试序号。
 * @returns 带有 `lm_retry` 查询参数的重试地址。
 */
export function appendRetryQuery(url: string, retry: number) {
  return appendQueryParameter(url, 'lm_retry', retry)
}
