export interface NavItem {
  text?: string
  link: string
  icon?: string
  /**
   * The target attribute of the <a> tag, specifying how to open the link
   */
  target?: '_blank' | '_self' | '_parent' | '_top' | ''
  /**
   * Submenu Items
   */
  items?: NavItem[]
}

export interface NavbarOptions {
  /**
   * Whether to display the site favicon
   * @efault true
   */
  showFavicon?: boolean
  /**
   * 导航栏 logo 图片地址，未设置时回退到站点 favicon。
   *
   * 建议提供不超过 64x64 的小尺寸资源，避免导航栏为了 32px 的展示位
   * 下载大体积的 favicon 文件。
   */
  logo?: string
  /**
   * The title of the navbar
   */
  title?: string
  /**
   * Tool buttons to include in the navbar
   * @default ['toggleDark', 'search']
   */
  tools?: ('toggleDark' | 'search')[]
  /**
   * The style of the hamburger menu in the navbar
   * - 'uneven': A style where one line is different in length
   * - 'classic': The traditional three equal-length lines
   * @default 'uneven'
   */
  hamburgerStyle?: 'uneven' | 'classic'

  /**
   * 导航栏是否随滚动自动隐藏/显示
   * @default true
   */
  autoHide?: boolean
}
