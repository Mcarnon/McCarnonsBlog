import type { Background, Hero } from '../../types'
import type { BackgroundScope, ResolvedBackground } from './types'
import { clampOpacity, normalizeUrls, pickFirstUrl } from './background-image'

/** 背景轮换的默认间隔，单位为毫秒。 */
const DEFAULT_ROTATION_INTERVAL = 12000

/** 图片背景的默认定位。 */
const DEFAULT_BACKGROUND_POSITION = 'center center'

/** 图片背景的默认尺寸。 */
const DEFAULT_BACKGROUND_SIZE = 'cover'

/** 解析主题背景所需的上下文选项。 */
export interface ResolveBackgroundOptions {
  /** 背景生效范围。 */
  scope: BackgroundScope
  /** 主题的全局背景配置。 */
  background: Background
  /** 首页 Hero 的独立封面配置。 */
  heroCover?: Hero['cover']
  /** 当前是否使用深色模式。 */
  isDark: boolean
  /** 当前是否使用移动端布局。 */
  isMobile: boolean
}

/** 规范化后的图片候选集合。 */
interface NormalizedImageCandidates {
  /** 保持配置顺序的静态图片地址。 */
  staticImageUrls: string[]
  /** 保持配置顺序的 API 图片地址。 */
  apiImageUrls: string[]
}

/** 组装图片背景解析结果所需的选项。 */
interface ResolvedImageOptions extends NormalizedImageCandidates {
  /** 当前背景命中的图片配置来源。 */
  source: 'hero' | 'background'
  /** 当前优先加载的目标图片。 */
  imageUrl: string
  /** 首屏与失败场景使用的稳定回退图片。 */
  fallbackImageUrl: string
  /** 是否启用随机图片模式。 */
  random: boolean
  /** 图片轮换间隔，单位为毫秒。 */
  rotationInterval?: number
  /** 图片遮罩层不透明度。 */
  overlayOpacity?: number
  /** 图片背景定位。 */
  position?: string
  /** 图片背景尺寸。 */
  size?: string
  /** 图片背景是否固定到视口。 */
  fixed: boolean
}

/**
 * 清理静态与 API 图片地址，保留各自的配置顺序。
 *
 * @param staticUrls - 静态图片地址列表。
 * @param apiUrls - API 图片地址列表。
 * @returns 规范化后的两类图片候选。
 */
function normalizeImageCandidates(
  staticUrls?: string[],
  apiUrls?: string[],
): NormalizedImageCandidates {
  return {
    staticImageUrls: normalizeUrls(staticUrls),
    apiImageUrls: normalizeUrls(apiUrls),
  }
}

/**
 * 按随机模式和设备或色彩偏好选择当前目标图片。
 *
 * @param candidates - 规范化后的图片候选。
 * @param random - 是否启用随机图片模式。
 * @param preferredUrl - 当前设备或色彩模式优先的单图地址。
 * @param alternateUrl - 优先单图不可用时采用的另一单图地址。
 * @returns 当前应优先加载的图片地址；无有效候选时返回空字符串。
 */
function resolvePrimaryImageUrl(
  candidates: NormalizedImageCandidates,
  random: boolean,
  preferredUrl?: string,
  alternateUrl?: string,
): string {
  if (random)
    return pickFirstUrl(candidates.apiImageUrls) || pickFirstUrl(candidates.staticImageUrls)

  return pickFirstUrl(candidates.staticImageUrls)
    || preferredUrl
    || alternateUrl
    || ''
}

/**
 * 按固定优先级选择回退图片，不进行随机选择；相同配置与运行环境输入下结果稳定。
 *
 * @param candidates - 规范化后的图片候选。
 * @param preferredUrl - 当前设备或色彩模式优先的单图地址。
 * @param alternateUrl - 优先单图不可用时采用的另一单图地址。
 * @returns 稳定回退图片地址；无有效候选时返回空字符串。
 */
function resolveStableFallbackUrl(
  candidates: NormalizedImageCandidates,
  preferredUrl?: string,
  alternateUrl?: string,
): string {
  return pickFirstUrl(candidates.staticImageUrls)
    || preferredUrl
    || alternateUrl
    || ''
}

/**
 * 判断随机图片配置是否具备可轮换的候选来源。
 *
 * @param random - 是否启用随机图片模式。
 * @param candidates - 规范化后的图片候选。
 * @returns API 候选非空或静态候选超过一张时返回 `true`。
 */
function resolveRotationEnabled(
  random: boolean,
  candidates: NormalizedImageCandidates,
): boolean {
  return Boolean(
    random
    && (candidates.apiImageUrls.length || candidates.staticImageUrls.length > 1),
  )
}

/**
 * 将图片候选、显示参数与默认值组装为统一背景结果。
 *
 * @param options - 图片背景结果的组装选项。
 * @returns 可供背景运行时消费的图片背景解析结果。
 */
function createResolvedImage(options: ResolvedImageOptions): ResolvedBackground {
  return {
    type: 'image',
    source: options.source,
    imageUrl: options.imageUrl,
    fallbackImageUrl: options.fallbackImageUrl,
    staticImageUrls: options.staticImageUrls,
    apiImageUrls: options.apiImageUrls,
    rotationEnabled: resolveRotationEnabled(options.random, options),
    rotationInterval: options.rotationInterval ?? DEFAULT_ROTATION_INTERVAL,
    random: options.random,
    gradientValue: '',
    colorValue: '',
    overlayOpacity: clampOpacity(options.overlayOpacity),
    position: options.position || DEFAULT_BACKGROUND_POSITION,
    size: options.size || DEFAULT_BACKGROUND_SIZE,
    fixed: options.fixed,
  }
}

/**
 * 解析有效的 Hero 独立封面。
 *
 * @param heroCover - Hero 独立封面配置。
 * @param isMobile - 当前是否使用移动端布局。
 * @returns 有有效图片候选时返回 Hero 图片背景，否则返回 `undefined`。
 */
function resolveHeroBackground(
  heroCover: NonNullable<Hero['cover']>,
  isMobile: boolean,
): ResolvedBackground | undefined {
  const candidates = normalizeImageCandidates(heroCover.urls, heroCover.apiUrls)
  const preferredUrl = isMobile ? heroCover.mobile : heroCover.desktop
  const alternateUrl = isMobile ? heroCover.desktop : heroCover.mobile
  const random = Boolean(heroCover.random)
  const imageUrl = resolvePrimaryImageUrl(candidates, random, preferredUrl, alternateUrl)
  const fallbackImageUrl = resolveStableFallbackUrl(candidates, preferredUrl, alternateUrl)

  if (!imageUrl && !fallbackImageUrl)
    return undefined

  return createResolvedImage({
    source: 'hero',
    imageUrl,
    fallbackImageUrl,
    ...candidates,
    random,
    rotationInterval: heroCover.rotationInterval,
    overlayOpacity: heroCover.overlayOpacity,
    position: DEFAULT_BACKGROUND_POSITION,
    size: DEFAULT_BACKGROUND_SIZE,
    fixed: heroCover.fixed ?? false,
  })
}

/**
 * 解析有效的全局图片背景。
 *
 * @param background - 主题全局背景配置。
 * @param isDark - 当前是否使用深色模式。
 * @returns 全局图片配置有效时返回图片背景，否则返回 `undefined`。
 */
function resolveGlobalImageBackground(
  background: Background,
  isDark: boolean,
): ResolvedBackground | undefined {
  if (background.type !== 'image' || !background.image)
    return undefined

  const backgroundImage = background.image
  const candidates = normalizeImageCandidates(backgroundImage.urls, backgroundImage.apiUrls)
  const preferredUrl = isDark ? backgroundImage.dark : backgroundImage.light
  const alternateUrl = isDark ? backgroundImage.light : backgroundImage.dark
  const random = Boolean(backgroundImage.random)
  const imageUrl = resolvePrimaryImageUrl(candidates, random, preferredUrl, alternateUrl)
  const fallbackImageUrl = resolveStableFallbackUrl(candidates, preferredUrl, alternateUrl)

  if (!imageUrl && !fallbackImageUrl)
    return undefined

  return createResolvedImage({
    source: 'background',
    imageUrl,
    fallbackImageUrl,
    ...candidates,
    random,
    rotationInterval: backgroundImage.rotationInterval,
    overlayOpacity: backgroundImage.overlayOpacity,
    position: backgroundImage.position,
    size: backgroundImage.size,
    fixed: backgroundImage.fixed ?? true,
  })
}

/**
 * 创建全局渐变背景解析结果。
 *
 * @param gradientValue - 当前色彩模式命中的 CSS 渐变值。
 * @returns 使用指定渐变且关闭图片轮换的解析结果。
 */
function createGradientBackground(gradientValue: string): ResolvedBackground {
  return {
    type: 'gradient',
    source: 'background',
    imageUrl: '',
    fallbackImageUrl: '',
    staticImageUrls: [],
    apiImageUrls: [],
    rotationEnabled: false,
    rotationInterval: DEFAULT_ROTATION_INTERVAL,
    random: false,
    gradientValue,
    colorValue: '',
    overlayOpacity: 0,
    position: DEFAULT_BACKGROUND_POSITION,
    size: DEFAULT_BACKGROUND_SIZE,
    fixed: true,
  }
}

/**
 * 创建无有效图片或渐变配置时的纯色背景解析结果。
 *
 * @returns 使用主题基础背景色且关闭图片轮换的解析结果。
 */
function createColorBackground(): ResolvedBackground {
  return {
    type: 'color',
    source: 'fallback',
    imageUrl: '',
    fallbackImageUrl: '',
    staticImageUrls: [],
    apiImageUrls: [],
    rotationEnabled: false,
    rotationInterval: DEFAULT_ROTATION_INTERVAL,
    random: false,
    gradientValue: '',
    colorValue: 'var(--lm-c-bg-base)',
    overlayOpacity: 0,
    position: DEFAULT_BACKGROUND_POSITION,
    size: DEFAULT_BACKGROUND_SIZE,
    fixed: true,
  }
}

/**
 * 依据作用域、主题配置、色彩模式与设备类型纯函数解析背景。
 *
 * Hero 仅在存在有效图片候选时覆盖全局背景；随机模式优先 API 候选，
 * 非随机模式优先静态列表，并始终保留固定顺序的稳定回退图片。
 *
 * @param options - 背景解析上下文。
 * @returns 完整且可直接交给背景运行时处理的解析结果。
 */
export function resolveBackground(options: ResolveBackgroundOptions): ResolvedBackground {
  if (options.scope === 'hero' && options.heroCover) {
    const heroBackground = resolveHeroBackground(options.heroCover, options.isMobile)

    if (heroBackground)
      return heroBackground
  }

  const imageBackground = resolveGlobalImageBackground(options.background, options.isDark)

  if (imageBackground)
    return imageBackground

  if (options.background.type === 'gradient' && options.background.gradient) {
    const gradientValue = options.isDark
      ? (options.background.gradient.dark || options.background.gradient.light || '')
      : (options.background.gradient.light || options.background.gradient.dark || '')

    if (gradientValue)
      return createGradientBackground(gradientValue)
  }

  return createColorBackground()
}
