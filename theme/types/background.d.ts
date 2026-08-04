export interface Background {
  /**
   * 背景类型
   * - image: 图片
   * - gradient: css渐变
   * - none: 纯色背景
   * @default 'none'
   */
  type: 'image' | 'gradient' | 'none'

  /**
   * 是否在 head 中预加载首屏背景图（SSR 输出 `<link rel="preload" as="image">`）
   *
   * 对 hero 与全局背景均生效，可让背景下载从 HTML 解析阶段就开始，
   * 而非等待脚本水合完成。使用随机图 API 时要求接口响应可缓存
   * （Cache-Control 非 no-store），否则可能造成同地址重复下载，此时应关闭该选项。
   * @default true
   */
  preload?: boolean

  /**
   * 背景图片配置，仅在 type 为 'image' 时有效
   * 支持 Light/Dark + 随机 API
   */
  image?: {
    light?: string
    dark?: string
    /**
     * 静态图片 URL 列表，优先级高于 light/dark 配置
     */
    urls?: string[]
    /**
     * 随机图片 API 列表，优先级高于静态图片 URL 列表
     */
    apiUrls?: string[]
    /**
     * 是否随机取图
     * @default false
     */
    random?: boolean
    /**
     * 图片定时轮换间隔（ms）
     * 仅当 random 为 true，且 apiUrls 至少包含一个有效地址或 urls 至少包含两张有效静态图片时生效
     * @default 12000
     */
    rotationInterval?: number
    /**
     * 图片位置
     * @default 'center center'
     */
    position?: string
    /**
     * 图片尺寸
     * @default 'cover'
     */
    size?: string
    /**
     * 图片是否固定
     * @default true
     */
    fixed?: boolean
    /**
     * 图片上层叠加遮罩透明度
     * @default 0.3
     */
    overlayOpacity?: number
  }

  /**
   * CSS 渐变配置，仅在 type 为 'gradient' 时有效
   */
  gradient?: {
    light?: string
    dark?: string
  }
}
