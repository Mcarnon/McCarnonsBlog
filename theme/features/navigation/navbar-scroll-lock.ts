import type { BrowserTimeout } from '../../shared/browser'
import { clearBrowserTimeout, getDocumentElement, getWindow, requestBrowserAnimationFrame, setBrowserTimeout } from '../../shared/browser'

/** 标记导航栏滚动响应已锁定的根元素属性名。 */
export const NAVBAR_SCROLL_LOCK_ATTR = 'data-lm-navbar-scroll-lock'

/** 导航栏滚动响应锁的释放时机选项。 */
export interface NavbarScrollLockOptions {
  /** 自动释放前等待的动画帧数。 */
  deferFrames?: number
  /** 自动释放前等待的毫秒数。 */
  timeoutMs?: number
}

/**
 * 临时锁定导航栏对滚动位置变化的响应。
 *
 * @param options - 按动画帧数或毫秒数自动释放锁的选项。
 * @returns 幂等的主动释放函数；非浏览器环境返回无副作用函数。
 */
export function lockNavbarScrollReaction(options: NavbarScrollLockOptions = {}) {
  const currentWindow = getWindow()
  const root = getDocumentElement()

  if (!currentWindow || !root)
    return () => {}

  const { deferFrames = 0, timeoutMs } = options
  let released = false
  let timeoutId: BrowserTimeout | undefined

  root.setAttribute(NAVBAR_SCROLL_LOCK_ATTR, 'true')

  /** 幂等地清除自动释放任务并移除根元素上的滚动锁标记。 */
  const release = () => {
    if (released)
      return

    released = true

    clearBrowserTimeout(timeoutId)

    root.removeAttribute(NAVBAR_SCROLL_LOCK_ATTR)
  }

  if (Number.isFinite(timeoutMs))
    timeoutId = setBrowserTimeout(release, timeoutMs)

  if (deferFrames > 0) {
    let remainingFrames = deferFrames

    /** 逐帧递减等待计数，并在达到目标帧数后释放滚动锁。 */
    const scheduleRelease = () => {
      if (released)
        return

      if (remainingFrames <= 0) {
        release()
        return
      }

      remainingFrames -= 1
      requestBrowserAnimationFrame(scheduleRelease)
    }

    requestBrowserAnimationFrame(scheduleRelease)
  }

  return release
}
