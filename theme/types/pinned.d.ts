export interface PinnedEntry {
  /**
   * 卡片标题
   */
  title: string

  /**
   * 卡片链接
   */
  link: string

  /**
   * 卡片描述
   */
  desc?: string

  /**
   * 卡片图片
   */
  img?: string
}

export interface Pinned {
  /**
   * 是否启用置顶卡片
   * @default true
   */
  enable: boolean

  /**
   * 置顶卡片标题
   */
  title?: string

  /**
   * 置顶卡片列表
   *
   * 布局说明：
   * - 移动端统一为横向滑动卡片组
   * - 桌面端 1 项时会收窄显示，避免整行铺满显得空
   * - 桌面端 2 项时为双列
   * - 桌面端 3 项时为三列
   * - 桌面端超过 3 项时重新退回单行横向滑动，避免变成第二个文章列表区
   */
  entries: PinnedEntry[]
}
