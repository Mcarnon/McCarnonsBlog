export interface Notice {
  /**
   * 是否启用公告
   * @default false
   */
  enable: boolean

  /**
   * 公告内容
   */
  message: string

  /**
   * 是否可关闭
   * @default true
   */
  closable?: boolean

  /**
   * 显示范围
   * @default 'home'
   */
  scope?: 'home' | 'global'
}
