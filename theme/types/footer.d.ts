export interface FooterIcp {
  /**
   * 备案号展示文本，例如：粤ICP备xxxx号 / 萌ICP备xxxx号
   */
  text: string

  /**
   * 备案链接。工信部备案可使用 https://beian.miit.gov.cn/，萌国 ICP 可填对应查询地址。
   */
  link?: string
}

export interface Footer {
  /**
   * 建站于
   */
  since?: number

  /**
   * Icon between year and copyright info.
   */
  icon?: {
    /**
     * icon name, i-xxx
     */
    enable?: boolean
    name?: string
    img?: string
    color?: string
    url?: string
    title?: string
  }

  /**
   * Powered by valaxy & valaxy-theme-${name}, default is yun
   */
  powered: boolean

  /**
   * Chinese Users | 中国用户
   * 备案 ICP。字符串写法默认跳转工信部备案；对象写法可自定义链接，兼容萌国 ICP。
   */
  icp?: string | FooterIcp
}
