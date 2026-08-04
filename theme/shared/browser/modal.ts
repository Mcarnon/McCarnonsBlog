import type { Ref } from 'vue'
import { nextTick, onBeforeUnmount, watch } from 'vue'
import { cancelBrowserAnimationFrame, getDocument, getDocumentBody, requestBrowserAnimationFrame } from './runtime'

/** 浮层内可通过键盘聚焦的元素选择器。 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** 可恢复焦点的交互元素选择器，额外允许显式声明 `tabindex="-1"` 的元素。 */
const RESTORABLE_FOCUS_SELECTOR = `${FOCUSABLE_SELECTOR},[tabindex="-1"]`

/** 单个已激活浮层的焦点域。 */
interface ModalFocusScope {
  /** 浮层容器响应式引用。 */
  container: Readonly<Ref<HTMLElement | undefined>>
  /** 最近一次解析到的容器元素，供离场后转移焦点恢复链。 */
  containerElement: HTMLElement | null
  /** 焦点域所属文档。 */
  document: Document
  /** 请求关闭当前浮层。 */
  onClose: () => void
  /** 打开浮层前持有焦点的元素。 */
  restoreTarget: HTMLElement | null
}

/** 单个被滚动锁改写的内联样式快照。 */
interface InlineStyleSnapshot {
  property: string
  value: string
  priority: string
}

/** 首个正文滚动锁持有的页面状态。 */
interface BodyScrollLockState {
  body: HTMLElement
  bodyStyles: InlineStyleSnapshot[]
  documentElement: HTMLElement
  documentElementStyles: InlineStyleSnapshot[]
  /** 本轮锁会话结束时是否允许恢复首个锁记录的页面坐标。 */
  restoreScroll: boolean
  scrollBehavior: InlineStyleSnapshot
  scrollX: number
  scrollY: number
  window: Window
}

/** 正文滚动锁释放选项。 */
export interface BodyScrollReleaseOptions {
  /** 是否允许本轮锁会话最终恢复旧坐标；任一持有者设为 `false` 后本轮持续生效。 */
  restoreScroll?: boolean
}

/** 浮层焦点约束停用选项。 */
export interface ModalDeactivateOptions extends BodyScrollReleaseOptions {
  /** 是否将焦点恢复至打开浮层前的触发元素。 */
  restoreFocus?: boolean
}

/** 浮层焦点约束组合式函数选项。 */
export interface ModalFocusTrapOptions {
  /** 浮层容器元素引用。 */
  container: Readonly<Ref<HTMLElement | undefined>>
  /** 是否同时锁定正文滚动。 */
  lockBodyScroll?: boolean
  /** 浮层开合状态。 */
  open: Readonly<Ref<boolean>>
  /** Escape 请求关闭时执行的回调。 */
  onClose: () => void
}

/** 正文滚动锁的幂等释放函数。 */
type BodyScrollRelease = (options?: BodyScrollReleaseOptions) => void

/** 当前页面按打开顺序排列的浮层焦点域。 */
const activeFocusScopes: ModalFocusScope[] = []
let keydownDocument: Document | undefined
let bodyScrollLockCount = 0
let bodyScrollLockState: BodyScrollLockState | undefined

const DOCUMENT_ELEMENT_LOCK_PROPERTIES = ['overflow'] as const
const BODY_LOCK_PROPERTIES = [
  'box-sizing',
  'left',
  'overflow',
  'padding-right',
  'position',
  'top',
  'width',
] as const

/**
 * 将文档元素安全收窄为 HTML 元素。
 *
 * @param element - 待判断的文档元素。
 * @param currentDocument - 元素预期所属的文档。
 * @returns 同文档 HTML 元素；类型或运行环境不匹配时返回 `null`。
 */
function resolveHtmlElement(element: Element | null, currentDocument: Document) {
  const HtmlElement = currentDocument.defaultView?.HTMLElement
  return HtmlElement && element instanceof HtmlElement ? element as HTMLElement : null
}

/**
 * 判断元素当前是否可见且未被禁用或惰性容器包裹。
 *
 * @param element - 待判断的 HTML 元素。
 * @returns 元素当前可接收焦点时返回 `true`。
 */
function isAvailableFocusTarget(element: HTMLElement) {
  const currentWindow = element.ownerDocument.defaultView
  if (!currentWindow || element.hidden || element.matches(':disabled') || element.closest('[inert]'))
    return false

  const style = currentWindow.getComputedStyle(element)
  return style.display !== 'none'
    && style.visibility !== 'hidden'
    && element.getClientRects().length > 0
}

/**
 * 判断元素是否可由脚本可靠聚焦。
 *
 * @param element - 待判断的初始焦点元素。
 * @returns 元素具备原生或显式 tabindex 聚焦语义时返回 `true`。
 */
function isProgrammaticallyFocusable(element: HTMLElement) {
  return element.matches(RESTORABLE_FOCUS_SELECTOR) && isAvailableFocusTarget(element)
}

/**
 * 获取焦点域内当前可参与 Tab 顺序的元素。
 *
 * @param container - 浮层焦点域容器。
 * @returns 正 tabindex 优先、其后按 DOM 顺序排列的可聚焦元素。
 */
function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .map((element, domIndex) => ({ domIndex, element }))
    .filter(({ element }) => element.tabIndex >= 0 && isAvailableFocusTarget(element))
    .sort((left, right) => {
      const leftHasPositiveTabIndex = left.element.tabIndex > 0
      const rightHasPositiveTabIndex = right.element.tabIndex > 0

      if (leftHasPositiveTabIndex && rightHasPositiveTabIndex)
        return left.element.tabIndex - right.element.tabIndex || left.domIndex - right.domIndex
      if (leftHasPositiveTabIndex)
        return -1
      if (rightHasPositiveTabIndex)
        return 1
      return left.domIndex - right.domIndex
    })
    .map(({ element }) => element)
}

/** 获取焦点域当前或最近一次挂载的容器元素。 */
function resolveScopeContainer(scope: ModalFocusScope) {
  const container = scope.container.value
  if (container)
    scope.containerElement = container

  return container ?? scope.containerElement
}

/**
 * 将焦点移入指定浮层，优先使用显式初始焦点标记。
 *
 * @param scope - 目标浮层焦点域。
 */
function focusScope(scope: ModalFocusScope) {
  const container = resolveScopeContainer(scope)
  if (!container)
    return

  const preferredTarget = container.querySelector<HTMLElement>('[data-modal-initial-focus]')
  const target = preferredTarget && isProgrammaticallyFocusable(preferredTarget)
    ? preferredTarget
    : getFocusableElements(container)[0]
      ?? (isProgrammaticallyFocusable(container) ? container : undefined)

  target?.focus({ preventScroll: true })
}

/**
 * 获取当前应接收键盘事件的最上层焦点域。
 *
 * @returns 最后打开且尚未关闭的浮层焦点域。
 */
function getTopFocusScope() {
  return activeFocusScopes[activeFocusScopes.length - 1]
}

/**
 * 查询当前是否存在活动的浮层焦点域。
 *
 * @param excludedContainer - 可选的自身容器；提供后仅查询除此容器之外的焦点域。
 * @returns 存在符合条件的活动焦点域时返回 `true`；SSR 阶段安全返回当前内存状态。
 */
export function hasActiveModalFocusScope(excludedContainer?: HTMLElement | null) {
  if (!excludedContainer)
    return activeFocusScopes.length > 0

  return activeFocusScopes.some(scope => (
    scope.container.value !== excludedContainer
    && scope.containerElement !== excludedContainer
  ))
}

/**
 * 处理所有浮层共享的键盘关闭与 Tab 环绕逻辑。
 *
 * @param event - 文档派发的键盘事件。
 */
function handleModalKeydown(event: KeyboardEvent) {
  const scope = getTopFocusScope()
  const container = scope && resolveScopeContainer(scope)
  if (!scope || !container)
    return

  if (event.key === 'Escape') {
    event.preventDefault()
    scope.onClose()
    return
  }

  if (event.key !== 'Tab')
    return

  const focusableElements = getFocusableElements(container)
  if (!focusableElements.length) {
    event.preventDefault()
    if (isProgrammaticallyFocusable(container))
      container.focus({ preventScroll: true })
    return
  }

  const activeElement = resolveHtmlElement(scope.document.activeElement, scope.document)
  const activeIndex = activeElement ? focusableElements.indexOf(activeElement) : -1
  const lastIndex = focusableElements.length - 1
  const nextIndex = event.shiftKey
    ? (activeIndex > 0 ? activeIndex - 1 : lastIndex)
    : (activeIndex >= 0 && activeIndex < lastIndex ? activeIndex + 1 : 0)

  event.preventDefault()
  focusableElements[nextIndex].focus({ preventScroll: true })
}

/** 根据焦点域栈状态挂载或移除唯一的文档键盘监听。 */
function syncModalKeydownListener() {
  const nextDocument = getTopFocusScope()?.document
  if (keydownDocument === nextDocument)
    return

  keydownDocument?.removeEventListener('keydown', handleModalKeydown)
  nextDocument?.addEventListener('keydown', handleModalKeydown)
  keydownDocument = nextDocument
}

/**
 * 在下一次渲染与绘制完成后恢复焦点，同时尊重可能仍然存在的上层浮层。
 *
 * @param scope - 刚刚关闭的浮层焦点域。
 * @param generation - 用于阻止过期恢复任务抢占焦点的代次。
 * @param isCurrentGeneration - 判断恢复任务是否仍有效的方法。
 */
async function restoreFocusAfterRender(
  scope: ModalFocusScope,
  generation: number,
  isCurrentGeneration: (generation: number) => boolean,
) {
  await nextTick()
  if (!isCurrentGeneration(generation))
    return

  const restore = () => {
    if (!isCurrentGeneration(generation))
      return

    const topScope = getTopFocusScope()
    if (topScope) {
      const topContainer = resolveScopeContainer(topScope)
      if (topContainer && scope.restoreTarget && topContainer.contains(scope.restoreTarget) && isAvailableFocusTarget(scope.restoreTarget)) {
        scope.restoreTarget.focus({ preventScroll: true })
        return
      }

      focusScope(topScope)
      return
    }

    const target = scope.restoreTarget
    if (target
      && target.ownerDocument === scope.document
      && scope.document.contains(target)
      && target.matches(RESTORABLE_FOCUS_SELECTOR)
      && isAvailableFocusTarget(target)) {
      target.focus({ preventScroll: true })
    }
  }

  const frameId = requestBrowserAnimationFrame(restore)
  if (frameId === undefined)
    restore()
}

/** 保存元素指定内联样式属性的原始值与优先级。 */
function captureInlineStyles(element: HTMLElement, properties: readonly string[]) {
  return properties.map(property => ({
    priority: element.style.getPropertyPriority(property),
    property,
    value: element.style.getPropertyValue(property),
  }))
}

/** 恢复单个内联样式属性。 */
function restoreInlineStyle(element: HTMLElement, snapshot: InlineStyleSnapshot) {
  if (snapshot.value)
    element.style.setProperty(snapshot.property, snapshot.value, snapshot.priority)
  else
    element.style.removeProperty(snapshot.property)
}

/** 恢复一组由滚动锁改写的内联样式属性。 */
function restoreInlineStyles(element: HTMLElement, snapshots: readonly InlineStyleSnapshot[]) {
  snapshots.forEach(snapshot => restoreInlineStyle(element, snapshot))
}

/**
 * 以引用计数方式锁定根页面滚动，兼容 iOS 的根滚动容器并避免桌面滚动条消失导致布局跳动。
 *
 * @returns 幂等释放函数；可为导航关闭禁止旧坐标恢复，SSR 或文档尚不可用时无副作用。
 */
export function lockBodyScroll(): BodyScrollRelease {
  const currentDocument = getDocument()
  const body = getDocumentBody()
  const documentElement = currentDocument?.documentElement
  const currentWindow = currentDocument?.defaultView
  if (!body || !documentElement || !currentWindow)
    return () => {}

  if (bodyScrollLockCount === 0) {
    const scrollbarWidth = Math.max(0, currentWindow.innerWidth - documentElement.clientWidth)
    const bodyPaddingRight = Number.parseFloat(currentWindow.getComputedStyle(body).paddingRight) || 0

    bodyScrollLockState = {
      body,
      bodyStyles: captureInlineStyles(body, BODY_LOCK_PROPERTIES),
      documentElement,
      documentElementStyles: captureInlineStyles(documentElement, DOCUMENT_ELEMENT_LOCK_PROPERTIES),
      restoreScroll: true,
      scrollBehavior: captureInlineStyles(documentElement, ['scroll-behavior'])[0],
      scrollX: currentWindow.scrollX,
      scrollY: currentWindow.scrollY,
      window: currentWindow,
    }

    documentElement.style.setProperty('overflow', 'hidden')
    body.style.setProperty('box-sizing', 'border-box')
    body.style.setProperty('left', `${-currentWindow.scrollX}px`)
    body.style.setProperty('overflow', 'hidden')
    body.style.setProperty('position', 'fixed')
    body.style.setProperty('top', `${-currentWindow.scrollY}px`)
    body.style.setProperty('width', '100%')

    if (scrollbarWidth > 0)
      body.style.setProperty('padding-right', `${bodyPaddingRight + scrollbarWidth}px`)
  }

  bodyScrollLockCount += 1
  let released = false

  /**
   * 幂等释放当前调用持有的正文滚动锁。
   *
   * @param releaseOptions - 当前释放的坐标恢复策略；`false` 会粘性禁用本轮会话的最终恢复。
   */
  return (releaseOptions = {}) => {
    if (released)
      return

    released = true
    if (releaseOptions.restoreScroll === false && bodyScrollLockState)
      bodyScrollLockState.restoreScroll = false

    bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1)
    if (bodyScrollLockCount > 0 || !bodyScrollLockState)
      return

    const state = bodyScrollLockState
    bodyScrollLockState = undefined

    restoreInlineStyles(state.body, state.bodyStyles)
    restoreInlineStyles(state.documentElement, state.documentElementStyles)

    if (!state.restoreScroll)
      return

    // 避免站点的平滑滚动样式让解锁后的坐标恢复产生可见动画。
    state.documentElement.style.setProperty('scroll-behavior', 'auto', 'important')
    try {
      state.window.scrollTo(state.scrollX, state.scrollY)
    }
    finally {
      restoreInlineStyle(state.documentElement, state.scrollBehavior)
    }
  }
}

/**
 * 为响应式浮层注册焦点进入、Tab 环绕、Escape 关闭与安全焦点恢复行为。
 *
 * @remarks
 * 所有实例共享一个文档 `keydown` 监听；嵌套浮层仅由最上层响应键盘事件。
 * 可选正文滚动锁使用引用计数，关闭或卸载时都会幂等释放。
 *
 * @param options - 浮层开合状态、容器引用、关闭方法及滚动锁选项。
 * @returns 可供导航选择场景同步停用当前焦点域的控制器。
 */
export function useModalFocusTrap(options: ModalFocusTrapOptions) {
  let currentScope: ModalFocusScope | undefined
  let releaseBodyScroll: BodyScrollRelease = () => {}
  let focusFrameId: number | undefined
  let generation = 0

  /** 激活焦点域、捕获触发焦点，并在浮层渲染后将焦点移入。 */
  async function activate() {
    if (currentScope)
      return

    const currentDocument = getDocument()
    if (!currentDocument)
      return

    generation += 1
    const currentGeneration = generation
    const scope: ModalFocusScope = {
      container: options.container,
      containerElement: null,
      document: currentDocument,
      onClose: options.onClose,
      restoreTarget: resolveHtmlElement(currentDocument.activeElement, currentDocument),
    }

    currentScope = scope
    activeFocusScopes.push(scope)
    syncModalKeydownListener()
    if (options.lockBodyScroll)
      releaseBodyScroll = lockBodyScroll()

    await nextTick()
    if (currentScope !== scope || currentGeneration !== generation)
      return

    const focus = () => {
      focusFrameId = undefined
      if (currentScope === scope && currentGeneration === generation)
        focusScope(scope)
    }

    focusFrameId = requestBrowserAnimationFrame(focus)
    if (focusFrameId === undefined)
      focus()
  }

  /**
   * 同步停用焦点域并释放资源，必要时异步恢复打开前的焦点与页面坐标。
   *
   * @param deactivateOptions - 当前停用的焦点及滚动坐标恢复策略。
   */
  function deactivate(deactivateOptions: ModalDeactivateOptions = {}) {
    const scope = currentScope
    if (!scope) {
      releaseBodyScroll(deactivateOptions)
      releaseBodyScroll = () => {}
      return
    }

    generation += 1
    cancelBrowserAnimationFrame(focusFrameId)
    focusFrameId = undefined

    const scopeIndex = activeFocusScopes.indexOf(scope)
    const wasTopScope = scopeIndex === activeFocusScopes.length - 1
    if (scopeIndex >= 0) {
      const scopeContainer = resolveScopeContainer(scope)

      // 非 LIFO 移除时，将指向当前浮层内部的恢复目标接到当前浮层的上游触发点。
      // 后续上层浮层依次关闭后，仍能回到最初有效的触发元素。
      if (scopeContainer) {
        activeFocusScopes.slice(scopeIndex + 1).forEach((activeScope) => {
          if (activeScope.restoreTarget && scopeContainer.contains(activeScope.restoreTarget))
            activeScope.restoreTarget = scope.restoreTarget
        })
      }

      activeFocusScopes.splice(scopeIndex, 1)
    }

    currentScope = undefined
    releaseBodyScroll(deactivateOptions)
    releaseBodyScroll = () => {}
    syncModalKeydownListener()

    if (deactivateOptions.restoreFocus !== false && wasTopScope) {
      const restoreGeneration = generation
      void restoreFocusAfterRender(scope, restoreGeneration, value => value === generation)
    }
  }

  watch(
    options.open,
    (open) => {
      if (open)
        void activate()
      else
        deactivate()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    deactivate()
  })

  return {
    deactivate,
  }
}
