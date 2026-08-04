import { useWindowScroll } from '@vueuse/core'
import { ref, watch } from 'vue'
import { getDocumentElement } from '../../shared/browser'
import { NAVBAR_SCROLL_LOCK_ATTR } from './navbar-scroll-lock'

/**
 * 根据滚动位置与方向控制导航栏显隐。
 *
 * 规则保持简单：关闭自动隐藏时始终显示；滚动响应未锁定时，顶部缓冲区内强制显示；
 * 超出缓冲区后仅在滚动幅度达到阈值时按方向切换状态。
 *
 * @param enabled - 是否启用自动隐藏。
 * @returns 导航栏当前可见状态。
 */
export function useNavbarVisibility(enabled = true) {
  const visible = ref(true)
  const lastScrollTop = ref(0)
  /** 顶部强制显示导航栏的滚动位置阈值。 */
  const startHideOffset = 96
  /** 触发导航栏显隐切换所需的最小滚动距离。 */
  const minDelta = 8

  const { y } = useWindowScroll()

  watch(
    () => Math.max(0, y.value),
    (currentTop) => {
      if (!enabled) {
        visible.value = true
        lastScrollTop.value = currentTop
        return
      }

      if (getDocumentElement()?.hasAttribute(NAVBAR_SCROLL_LOCK_ATTR)) {
        lastScrollTop.value = currentTop
        return
      }

      const delta = currentTop - lastScrollTop.value

      // 顶部缓冲区内强制显示，避免首屏附近轻微滚动时出现闪烁感。
      if (currentTop < startHideOffset) {
        visible.value = true
        lastScrollTop.value = currentTop
        return
      }

      // 忽略触摸板和鼠标滚轮的微小抖动，只响应明确的滚动方向。
      if (Math.abs(delta) < minDelta)
        return

      visible.value = delta <= 0
      lastScrollTop.value = currentTop
    },
    { immediate: true },
  )

  return {
    visible,
  }
}
