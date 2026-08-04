/**
 * Hitokoto API `c` 查询参数允许的句子分类代码。
 *
 * 主题用户可在 `hero.hitokoto.sentenceTypes` 中组合多个分类，主题会为每个分类追加一个 `c` 参数。
 */
export type HitokotoSentenceType
  = | 'a'
    | 'b'
    | 'c'
    | 'd'
    | 'e'
    | 'f'
    | 'g'
    | 'h'
    | 'i'
    | 'j'
    | 'k'
    | 'l'

/** Hero 签名的内容来源：主题配置或 Hitokoto API。 */
export type HeroMottoSource = 'config' | 'hitokoto'

/** Hero 使用 Hitokoto API 时的展示与查询配置。 */
export interface HitokotoOptions {
  /**
   * 是否在一言后展示来源
   * @default false
   */
  showFrom?: boolean

  /**
   * 一言正文与来源之间的分隔符
   * @default '——'
   */
  fromSeparator?: string

  /**
   * 一言句子分类，可组合多个 `HitokotoSentenceType` 并分别作为 API 的 `c` 查询参数
   * @example ['a', 'c']
   */
  sentenceTypes?: HitokotoSentenceType[]

  /** 一言最小长度，对应 API 的 `min_length` 查询参数。 */
  minLength?: number

  /** 一言最大长度，对应 API 的 `max_length` 查询参数。 */
  maxLength?: number
}

/** 主题首页 Hero 首屏的内容、行为与独立封面配置。 */
export interface Hero {
  /**
   * 首屏独立封面设置
   * - 不配置 cover: 不启用独立首屏封面，直接透出全局背景
   * - 配置 cover: 以 cover 为准，覆盖全局背景设置
   */
  cover?: HeroCover

  /**
   * 签名文字
   * 支持字符串（固定显示）或字符串数组（按间隔轮换显示，可配合打字机效果）
   * @default ''
   */
  motto: string | string[]

  /**
   * 签名文案来源
   * - config: 使用 themeConfig.hero.motto
   * - hitokoto: 使用内置 Hitokoto API
   * @default 'config'
   */
  mottoSource: HeroMottoSource

  /** 一言在 Hero 签名中的展示与请求配置。 */
  hitokoto: HitokotoOptions

  /**
   * 签名轮换间隔（ms）
   * - mottoSource 为 config 且 motto 为字符串数组时，控制下一条签名开始显示的间隔
   * - mottoSource 为 hitokoto 时，控制下一次一言刷新尝试的间隔
   * @default 4000
   */
  mottoInterval: number

  /**
   * 是否启用打字机效果
   * @default true
   */
  typewriter: boolean

  /**
   * 打字机效果速度（ms/字符），在 typewriter 为 true 且存在签名时生效
   * @default 100
   */
  typingSpeed: number

  /**
   * 是否在封面上显示社交图标
   * @default true
   */
  showSocialIcons: boolean

  /**
   * 是否显示向下滚动箭头
   * @default true
   */
  showScrollDown: boolean

  /**
   * 封面高度
   * @default '100vh'
   */
  height: string

  /**
   * 封面上文字的对齐方式
   * @default 'center'
   */
  textAlign: 'left' | 'center' | 'right'
}

/** Hero 独立封面的图片来源、轮换方式与视觉参数。 */
interface HeroCover {
  /** 本地或静态图片地址列表。 */
  urls?: string[]

  /** 随机图片 API 地址列表。 */
  apiUrls?: string[]

  /**
   * 是否启用随机取图
   * - true: 优先使用 apiUrls 中的随机图片，apiUrls 为空时使用 urls 中的随机图片
   * - false: 使用 desktop/mobile 中的单图或 urls 中的第一张图片
   * @default false
   */
  random?: boolean

  /**
   * 图片定时轮换间隔（ms）
   * 仅当 random 为 true，且 apiUrls 至少包含一个有效地址或 urls 至少包含两张有效静态图片时生效
   * @default 12000
   */
  rotationInterval?: number

  /** 当 random 为 false 且 urls 为空时使用的桌面端单图地址。 */
  desktop?: string

  /** 当 random 为 false 且 urls 为空时使用的移动端单图地址。 */
  mobile?: string

  /**
   * 是否固定背景
   * @default false
   */
  fixed?: boolean

  /**
   * 封面叠加遮罩透明度（0-1），帮助文字在图片上可读
   * @default 0.3
   */
  overlayOpacity?: number
}
