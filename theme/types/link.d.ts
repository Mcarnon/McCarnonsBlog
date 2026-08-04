export interface LinkItem {
  avatar: string
  name: string
  url: string
  color?: string
  blog?: string
  desc: string
  rss?: string
}

export interface LinkGroup {
  title?: string
  items: LinkItem[]
}

export interface Links {
  /**
   * 在浏览器端尝试检测友链可访问状态。
   * 状态点显示在头像右下角：主题色 = 检测中，绿色 = 可访问，红色 = 暂不可访问，灰色 = 未知状态。
   *
   * 这是纯前端的尽力探测，跨域限制下不能保证拿到真实 HTTP 状态码。
   */
  statusCheck?: boolean
  groups: LinkGroup[]
}
