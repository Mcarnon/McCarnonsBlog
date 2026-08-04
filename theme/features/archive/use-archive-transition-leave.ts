import type { BrowserTimeout } from '../../shared/browser'
import { onBeforeUnmount } from 'vue'
import { clearBrowserTimeout, prefersReducedMotion, setBrowserTimeout } from '../../shared/browser'

/** 离场动画未触发结束事件时的兜底完成时限。 */
const ARCHIVE_LEAVE_FALLBACK_DELAY = 300

/** Vue Transition 提供的离场完成回调。 */
type ArchiveLeaveDone = () => void

interface PendingArchiveLeave {
  element: Element
  done: ArchiveLeaveDone
  fallbackTimer: BrowserTimeout | undefined
  handleTransitionEnd: (event: Event) => void
  handleTransitionCancel: (event: Event) => void
}

/**
 * 管理单个归档展示模式中唯一允许存在的离场节点。
 *
 * 新离场开始时通过旧节点的 Vue `done` 回调完成正式卸载，不直接操作 DOM；
 * 动画结束、取消、超时兜底和组件卸载都会释放事件监听与定时器。
 *
 * @param resolveExpectedProperty - 返回用于判定离场完成的 CSS 过渡属性名。
 * @returns 可直接绑定到 Vue Transition 的离场钩子。
 */
export function useArchiveTransitionLeave(
  resolveExpectedProperty: (element: Element) => string,
) {
  let pendingLeave: PendingArchiveLeave | undefined

  /** 清除指定离场记录注册的浏览器副作用。 */
  function cleanupLeave(record: PendingArchiveLeave) {
    record.element.removeEventListener('transitionend', record.handleTransitionEnd)
    record.element.removeEventListener('transitioncancel', record.handleTransitionCancel)
    clearBrowserTimeout(record.fallbackTimer)
    record.fallbackTimer = undefined
  }

  /** 通过 Vue 回调完成仍属于当前记录的离场节点。 */
  function completeLeave(record: PendingArchiveLeave) {
    if (pendingLeave !== record)
      return

    pendingLeave = undefined
    cleanupLeave(record)
    record.done()
  }

  /** 完成当前未决离场，供下一次离场与组件卸载复用。 */
  function completePendingLeave() {
    if (pendingLeave)
      completeLeave(pendingLeave)
  }

  /**
   * 接管 Vue 离场完成时机，并在新离场开始前正式完成旧节点卸载。
   *
   * @param element - 当前开始离场的节点。
   * @param done - Vue Transition 的离场完成回调。
   */
  function leave(element: Element, done: ArchiveLeaveDone) {
    completePendingLeave()

    if (prefersReducedMotion()) {
      done()
      return
    }

    const expectedProperty = resolveExpectedProperty(element)
    let record: PendingArchiveLeave

    /** 仅在目标节点的关键 CSS 属性结束过渡时完成离场。 */
    function handleTransitionEnd(event: Event) {
      const transitionEvent = event as TransitionEvent
      if (transitionEvent.target === element && transitionEvent.propertyName === expectedProperty)
        completeLeave(record)
    }

    /** 关键 CSS 属性的过渡被浏览器取消时立即完成离场。 */
    function handleTransitionCancel(event: Event) {
      const transitionEvent = event as TransitionEvent
      if (transitionEvent.target === element && transitionEvent.propertyName === expectedProperty)
        completeLeave(record)
    }

    record = {
      element,
      done,
      fallbackTimer: undefined,
      handleTransitionEnd,
      handleTransitionCancel,
    }
    pendingLeave = record

    element.addEventListener('transitionend', handleTransitionEnd)
    element.addEventListener('transitioncancel', handleTransitionCancel)
    record.fallbackTimer = setBrowserTimeout(
      () => completeLeave(record),
      ARCHIVE_LEAVE_FALLBACK_DELAY,
    )
  }

  /**
   * Vue 已自行结束或取消离场时，仅清理对应记录，不重复调用完成回调。
   *
   * @param element - 已结束或取消离场的节点。
   */
  function releaseLeave(element: Element) {
    const record = pendingLeave
    if (!record || record.element !== element)
      return

    pendingLeave = undefined
    cleanupLeave(record)
  }

  onBeforeUnmount(completePendingLeave)

  return {
    leave,
    releaseLeave,
  }
}
