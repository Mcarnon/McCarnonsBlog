import type { CSSProperties } from 'vue'
import type { BackgroundScope, ResolvedBackground } from './types'
import { clamp } from '../../shared/utils'

/** 创建图片背景样式时可覆盖的定位、尺寸与固定方式。 */
interface BackgroundImageStyleOptions {
  /** 是否将背景图固定在视口上，默认随页面滚动。 */
  fixed?: boolean
  /** CSS `background-position` 值，默认居中。 */
  position?: string
  /** CSS `background-size` 值，默认覆盖容器。 */
  size?: string
}

/**
 * 清理图片地址列表中的首尾空白与空值。
 *
 * @param urls - 待清理的图片地址列表。
 * @returns 保持原顺序的有效图片地址；未提供列表时返回空数组。
 */
export function normalizeUrls(urls?: string[]) {
  return urls?.map(url => url.trim()).filter(Boolean) || []
}

/**
 * 取得清理后图片地址列表中的第一个候选。
 *
 * @param urls - 待选择的图片地址列表。
 * @returns 第一个有效地址；没有候选时返回空字符串。
 */
export function pickFirstUrl(urls?: string[]) {
  return normalizeUrls(urls)[0] || ''
}

/**
 * 从清理后的图片地址列表中等概率选择一个候选。
 *
 * @param urls - 待随机选择的图片地址列表。
 * @returns 随机命中的有效地址；没有候选时返回空字符串。
 */
export function pickRandomUrl(urls?: string[]) {
  const candidates = normalizeUrls(urls)

  if (!candidates.length)
    return ''

  return candidates[Math.floor(Math.random() * candidates.length)] || ''
}

/**
 * 将背景遮罩不透明度限制在 0 到 1 的闭区间内。
 *
 * @param opacity - 待规范化的不透明度。
 * @param fallback - 输入不是有效数字时使用的兜底值，默认为 `0.3`。
 * @returns 有效输入经区间限制后的值，或原样返回兜底值。
 */
export function clampOpacity(opacity?: number, fallback = 0.3) {
  if (typeof opacity !== 'number' || Number.isNaN(opacity))
    return fallback

  return clamp(opacity, 0, 1)
}

/**
 * 生成已加载背景图的模块级缓存键。
 *
 * @param scope - 背景生效范围。
 * @param background - 当前解析后的背景。
 * @returns 图片背景由范围、来源和地址组成的键；非图片背景返回范围级固定键。
 */
export function getBackgroundCacheKey(scope: BackgroundScope, background: ResolvedBackground) {
  if (background.type !== 'image' || !background.imageUrl)
    return `${scope}:non-image`

  return `${scope}:${background.source}:${background.imageUrl}`
}

/**
 * 为图片地址追加当前时间戳查询参数以绕过浏览器缓存。
 *
 * @param url - 原始图片地址。
 * @returns 带 `_ts` 查询参数的地址；空地址返回空字符串。
 */
export function withCacheBust(url: string) {
  if (!url)
    return ''

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}_ts=${Date.now()}`
}

/**
 * 根据随机背景配置选择下一张轮换图片。
 *
 * @param background - 当前解析后的背景。
 * @returns API 候选优先且附带防缓存参数，否则返回随机静态候选；非随机模式返回空字符串。
 */
export function getRotationCandidate(background: ResolvedBackground) {
  if (!background.random)
    return ''

  if (background.apiImageUrls.length)
    return withCacheBust(pickRandomUrl(background.apiImageUrls))

  return pickRandomUrl(background.staticImageUrls)
}

/**
 * 判断随机 API 背景在加载完成前是否应保持透明。
 *
 * @param background - 当前解析后的背景。
 * @param options - 透明等待策略选项。
 * @param options.transparentUntilLoaded - 是否在目标图片加载完成前保持背景层透明。
 * @returns 仅当显式启用策略、处于随机模式且存在 API 候选时返回 `true`。
 */
export function shouldUseTransparentFallback(
  background: ResolvedBackground,
  options: { transparentUntilLoaded?: boolean },
) {
  return Boolean(
    options.transparentUntilLoaded
    && background.random
    && background.apiImageUrls.length,
  )
}

/**
 * 创建图片背景层使用的 Vue 内联样式。
 *
 * @param imageUrl - 待显示的图片地址。
 * @param options - 背景定位、尺寸与固定方式选项。
 * @returns 图片地址为空时返回空样式，否则返回完整图片背景样式。
 */
export function createBackgroundImageStyle(
  imageUrl: string,
  options: BackgroundImageStyleOptions = {},
): CSSProperties {
  if (!imageUrl)
    return {}

  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundPosition: options.position || 'center center',
    backgroundSize: options.size || 'cover',
    backgroundAttachment: options.fixed ? 'fixed' : 'scroll',
  }
}
