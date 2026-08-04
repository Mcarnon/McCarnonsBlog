/** 背景生效范围，用于区分全局应用背景与首页 Hero 局部背景。 */
export type BackgroundScope = 'app' | 'hero'

/** 解析后的背景展示类型。 */
export type BackgroundKind = 'image' | 'gradient' | 'color'

/** 背景配置的来源，用于区分 Hero、全局背景与最终兜底。 */
export type BackgroundSource = 'hero' | 'background' | 'fallback'

/**
 * 主题背景经过配置、色彩模式与设备宽度等条件解析后的统一结果。
 *
 * 该结构同时描述当前目标图片、稳定兜底图片、轮换候选与视觉样式，
 * 供背景运行时以一致方式处理 SSR、预加载、过渡和失败回退。
 */
export interface ResolvedBackground {
  /** 当前背景的展示类型。 */
  type: BackgroundKind
  /** 当前背景命中的配置来源。 */
  source: BackgroundSource
  /** 当前希望加载并显示的目标图片地址。 */
  imageUrl: string
  /** 首屏与加载失败时使用的稳定兜底图片地址。 */
  fallbackImageUrl: string
  /** 参与兜底或随机轮换的静态图片地址列表。 */
  staticImageUrls: string[]
  /** 参与随机轮换的 API 图片地址列表。 */
  apiImageUrls: string[]
  /** 是否启用图片定时轮换。 */
  rotationEnabled: boolean
  /** 图片轮换间隔，单位为毫秒。 */
  rotationInterval: number
  /** 是否按随机背景模式解析与轮换图片。 */
  random: boolean
  /** 渐变背景使用的 CSS 背景值。 */
  gradientValue: string
  /** 纯色背景使用的 CSS 颜色值。 */
  colorValue: string
  /** 图片上方遮罩层的不透明度，范围为 0 到 1。 */
  overlayOpacity: number
  /** 图片背景的 CSS 定位值。 */
  position: string
  /** 图片背景的 CSS 尺寸值。 */
  size: string
  /** 图片背景是否相对视口固定。 */
  fixed: boolean
}
