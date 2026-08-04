import type { CSSProperties } from 'vue'
import { useCssVar } from '@vueuse/core'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getDocumentElement } from '../../shared/browser'
import { useThemeConfig } from '../../shared/config'
import { useSearchModal } from '../search'
import { useMobileDrawer } from './use-mobile-drawer'
import { useNavbarVisibility } from './use-navbar-visibility'

/**
 * 汇总页面布局壳层所需的导航、抽屉、搜索、公告与顶栏显示状态。
 *
 * @returns 布局组件可直接消费的响应式状态与交互方法。
 */
export function useLayoutShell() {
  const themeConfig = useThemeConfig()
  const route = useRoute()
  const root = getDocumentElement()
  const navbarOffset = useCssVar('--lm-navbar-offset', root)

  const navItems = computed(() => themeConfig.value.navbar.filter(item => item.text))
  const { isOpen: isDrawerOpen, close: closeDrawer, toggle: toggleDrawer } = useMobileDrawer()
  const { isOpen: isDesktopDrawerOpen, close: closeDesktopDrawer, toggle: toggleDesktopDrawer } = useMobileDrawer()
  const { isOpen: isSearchOpen, open: openSearch, close: closeSearch } = useSearchModal()
  const { visible } = useNavbarVisibility(themeConfig.value.navbarOptions?.autoHide ?? true)
  const isHomeLayout = computed(() => route.meta.layout === 'home')

  // 桌面端抽屉中的导航项不包含首页（首页已在品牌区展示）
  const desktopNavItems = computed(() =>
    navItems.value.filter(item => item.link !== '/'),
  )

  // Surface 层的上边界只取决于"首页 Hero 舞台高度"这一配置语义，
  // 因此直接用配置值生成内联样式，让 SSR 产物与水合后完全一致。
  // 相比运行时测量 Hero bounding 再写 CSS 变量，这里没有首帧跳变，也不产生布局偏移。
  const pageSurfaceStyle = computed<CSSProperties>(() => ({
    top: isHomeLayout.value ? (themeConfig.value.hero.height || '100vh') : '0px',
  }))

  const showGlobalNotice = computed(() => {
    const notice = themeConfig.value.notice
    return !isHomeLayout.value && notice.enable && notice.scope === 'global' && Boolean(notice.message?.trim())
  })

  // 头部壳层的显示状态必须同时考虑 drawer/search 的打开状态。
  // 否则导航虽然被滚动逻辑隐藏了，但抽屉或搜索层还在屏幕上，会出现"壳层和浮层脱节"。
  const headerVisible = computed(() => {
    return isDrawerOpen.value || isDesktopDrawerOpen.value || isSearchOpen.value || visible.value
  })

  watch(
    headerVisible,
    (value) => {
      navbarOffset.value = value ? '4.5rem' : '0.75rem'
    },
    { immediate: true },
  )

  // 移动端打开时关闭桌面抽屉，反之亦然
  watch(isDrawerOpen, (open) => {
    if (open && isDesktopDrawerOpen.value)
      closeDesktopDrawer()
  })
  watch(isDesktopDrawerOpen, (open) => {
    if (open && isDrawerOpen.value)
      closeDrawer()
  })

  return {
    closeDrawer,
    closeDesktopDrawer,
    closeSearch,
    desktopNavItems,
    headerVisible,
    isDesktopDrawerOpen,
    isDrawerOpen,
    isSearchOpen,
    navItems,
    openSearch,
    pageSurfaceStyle,
    showGlobalNotice,
    toggleDesktopDrawer,
    toggleDrawer,
  }
}
