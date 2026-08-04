import type { HitokotoSentenceType } from '../../types'

/** Hitokoto API 返回的 Hero 一言所需字段。 */
export interface HitokotoResponse {
  /** 一言正文。 */
  hitokoto?: string
  /** 作品或出处名称。 */
  from?: string
  /** 原作者名称；API 未提供时可能为 `null`。 */
  fromWho?: string | null
}

/** 发起 Hitokoto API 请求时支持的查询选项。 */
export interface FetchHitokotoOptions {
  /** 作为 `c` 参数提交的句子分类，可同时指定多个分类。 */
  sentenceTypes?: HitokotoSentenceType[]
  /** 作为 `min_length` 参数提交的一言最小长度。 */
  minLength?: number
  /** 作为 `max_length` 参数提交的一言最大长度。 */
  maxLength?: number
}

/** Hero 一言使用的 Hitokoto API 地址。 */
const HITOKOTO_API_URL = 'https://v1.hitokoto.cn/'

/**
 * 将有效的非负数值向下取整后写入查询参数。
 *
 * @param searchParams - 待更新的 URL 查询参数。
 * @param key - 查询参数名称。
 * @param value - 查询参数数值；非数字、`NaN` 或负数会被忽略。
 */
function appendNumberParam(searchParams: URLSearchParams, key: string, value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0)
    return

  searchParams.set(key, String(Math.floor(value)))
}

/**
 * 根据分类和长度限制创建 Hitokoto API 请求地址。
 *
 * @param options - 一言分类与长度查询选项。
 * @returns 保留分类顺序并去重后的完整请求地址。
 */
function createHitokotoUrl(options: FetchHitokotoOptions = {}) {
  const searchParams = new URLSearchParams()

  options.sentenceTypes
    ?.filter((type, index, list) => Boolean(type) && list.indexOf(type) === index)
    .forEach(type => searchParams.append('c', type))

  appendNumberParam(searchParams, 'min_length', options.minLength)
  appendNumberParam(searchParams, 'max_length', options.maxLength)

  const queryString = searchParams.toString()
  return queryString ? `${HITOKOTO_API_URL}?${queryString}` : HITOKOTO_API_URL
}

/**
 * 请求一条供 Hero 展示的一言。
 *
 * @param options - 一言分类与长度查询选项。
 * @param signal - 用于取消当前网络请求的可选信号。
 * @returns Hitokoto API 返回的正文和来源信息。
 * @throws HTTP 响应状态不是成功状态或请求被取消时抛出错误。
 */
export async function fetchHitokoto(options: FetchHitokotoOptions = {}, signal?: AbortSignal) {
  const response = await fetch(createHitokotoUrl(options), { signal })
  if (!response.ok)
    throw new Error(`Failed to fetch hitokoto: ${response.status}`)

  return await response.json() as HitokotoResponse
}
