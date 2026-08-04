import type { MaybeRefOrGetter } from 'vue'
import type { NavItem } from '../../types'
import { computed, toValue } from 'vue'
import { getWindow } from '../../shared/browser'
import { useNavActive } from './use-nav-active'

/** 可参与导航外链判断的 HTTP 协议集合。 */
const HTTP_PROTOCOLS = new Set(['http:', 'https:'])

/**
 * 判断导航链接是否指向当前站点之外的 HTTP(S) 地址。
 *
 * @param link - 待判断的导航链接。
 * @returns 浏览器环境中链接指向不同源 HTTP(S) 地址时返回 `true`。
 */
export function isExternalNavLink(link: string) {
  const currentWindow = getWindow()
  if (!currentWindow)
    return false

  try {
    const url = new URL(link, currentWindow.location.href)
    if (!HTTP_PROTOCOLS.has(url.protocol))
      return false

    return url.origin !== currentWindow.location.origin
  }
  catch {
    return false
  }
}

/**
 * 判断导航项是否应显示外部链接标记。
 *
 * @param item - 待判断的导航项。
 * @returns 导航项指向站外 HTTP(S) 地址时返回 `true`。
 */
export function shouldShowExternalNavIndicator(item: NavItem) {
  return isExternalNavLink(item.link)
}

/**
 * 判断导航项是否应通过浏览器窗口 API 打开。
 *
 * @param item - 待判断的导航项。
 * @returns 导航项为外链或指定非 `_self` 目标时返回 `true`。
 */
export function shouldOpenNavLinkWithWindow(item: NavItem) {
  return isExternalNavLink(item.link) || Boolean(item.target && item.target !== '_self')
}

/**
 * 将同源 HTTP(S) 链接解析为 Vue Router 可消费的站内路由地址。
 *
 * @param link - 待解析的导航链接。
 * @returns 同源链接的路径、查询参数与哈希组合；其他情况返回原链接。
 */
export function resolveInternalNavRoute(link: string) {
  const currentWindow = getWindow()
  if (!currentWindow)
    return link

  try {
    const url = new URL(link, currentWindow.location.href)
    if (!HTTP_PROTOCOLS.has(url.protocol) || url.origin !== currentWindow.location.origin)
      return link

    return `${url.pathname}${url.search}${url.hash}`
  }
  catch {
    return link
  }
}

/**
 * 派生导航项自身、子项及整体的激活状态。
 *
 * @param item - 导航项或可解析为导航项的响应式输入。
 * @returns 子项列表、层级状态与激活状态的计算引用。
 */
export function useNavItemState(item: MaybeRefOrGetter<NavItem>) {
  const { isActive } = useNavActive()

  const children = computed(() => toValue(item).items ?? [])
  const hasChildren = computed(() => children.value.length > 0)
  const itemActive = computed(() => isActive(toValue(item).link))
  const childActive = computed(() => children.value.some(child => isActive(child.link)))
  const active = computed(() => itemActive.value || childActive.value)

  return {
    active,
    childActive,
    children,
    hasChildren,
    itemActive,
  }
}
