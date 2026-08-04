/**
 * 判断当前代码是否同时具备浏览器的 `window` 与 `document` 运行环境。
 *
 * @returns 两个浏览器全局对象均可用时返回 `true`，SSR/SSG 环境返回 `false`。
 */
export function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/** 浏览器 `window` 对象的非空类型，用于统一描述运行时窗口依赖。 */
export type BrowserWindow = NonNullable<ReturnType<typeof getWindow>>

/** 浏览器定时器标识类型，保持与 DOM `setTimeout` 返回值一致。 */
export type BrowserTimeout = number

/** 浏览器动画帧标识类型，用于请求和取消动画帧。 */
export type BrowserAnimationFrame = number

/**
 * 安全获取浏览器 `window` 对象，避免 SSR/SSG 阶段直接访问全局变量。
 *
 * @returns 浏览器窗口；非浏览器环境返回 `undefined`。
 */
export function getWindow() {
  // 所有浏览器全局访问统一经过这里，避免 SSR/SSG 阶段直接触碰 window。
  if (typeof window === 'undefined')
    return undefined

  return window
}

/**
 * 安全获取浏览器 `document` 对象，供共享模块统一处理服务端渲染边界。
 *
 * @returns 当前文档；非浏览器环境返回 `undefined`。
 */
export function getDocument() {
  if (typeof document === 'undefined')
    return undefined

  return document
}

/**
 * 获取当前文档的根元素，避免调用方直接依赖浏览器全局对象。
 *
 * @returns 文档根元素；文档不可用时返回 `undefined`。
 */
export function getDocumentElement() {
  return getDocument()?.documentElement ?? undefined
}

/**
 * 获取当前文档的正文元素，兼容文档尚未创建或服务端渲染场景。
 *
 * @returns 文档正文元素；正文不可用时返回 `undefined`。
 */
export function getDocumentBody() {
  return getDocument()?.body ?? undefined
}

/**
 * 读取根元素的计算字体大小，为依赖 `rem` 的尺寸换算提供统一基准。
 *
 * @param fallback - 浏览器环境或有效字号不可用时采用的兜底值。
 * @returns 可解析的根字号，解析失败时返回兜底值。
 */
export function getRootFontSize(fallback = 16) {
  const currentWindow = getWindow()
  const root = getDocumentElement()

  if (!currentWindow || !root)
    return fallback

  const parsed = Number.parseFloat(currentWindow.getComputedStyle(root).fontSize)
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * 安全获取会话存储；同时兼容 SSR 和浏览器隐私策略导致的访问异常。
 *
 * @returns 可用的 `sessionStorage`，不可访问时返回 `undefined`。
 */
export function getSessionStorage() {
  try {
    return getWindow()?.sessionStorage
  }
  catch {
    return undefined
  }
}

/**
 * 仅在浏览器环境注册延时任务，避免 SSR 阶段产生跨请求定时器。
 *
 * @param handler - 到期后执行的回调。
 * @param timeout - 延迟毫秒数。
 * @returns 浏览器定时器标识；窗口不可用时返回 `undefined`。
 */
export function setBrowserTimeout(handler: () => void, timeout?: number): BrowserTimeout | undefined {
  return getWindow()?.setTimeout(handler, timeout)
}

/**
 * 安全清除浏览器定时器；标识或窗口不存在时不产生副作用。
 *
 * @param timeoutId - 待清除的浏览器定时器标识。
 */
export function clearBrowserTimeout(timeoutId: BrowserTimeout | undefined) {
  if (timeoutId !== undefined)
    getWindow()?.clearTimeout(timeoutId)
}

/**
 * 仅在浏览器环境请求下一动画帧，用于将视觉更新与浏览器绘制同步。
 *
 * @param callback - 动画帧执行时接收时间戳的回调。
 * @returns 动画帧标识；窗口不可用时返回 `undefined`。
 */
export function requestBrowserAnimationFrame(callback: FrameRequestCallback) {
  return getWindow()?.requestAnimationFrame(callback)
}

/**
 * 安全取消已请求的浏览器动画帧；标识或窗口不存在时不产生副作用。
 *
 * @param frameId - 待取消的动画帧标识。
 */
export function cancelBrowserAnimationFrame(frameId: BrowserAnimationFrame | undefined) {
  if (frameId !== undefined)
    getWindow()?.cancelAnimationFrame(frameId)
}

/**
 * 按 DOM 标准语义切换单个元素的 CSS 类名。
 *
 * @param element - 待操作的元素；不可用时安全跳过。
 * @param className - 待切换的 CSS 类名。
 * @param force - 指定时强制添加或移除；省略时按元素当前状态切换。
 */
function toggleElementClass(element: Element | undefined, className: string, force?: boolean) {
  if (!element)
    return

  if (force === undefined) {
    element.classList.toggle(className)
    return
  }

  element.classList.toggle(className, force)
}

/**
 * 同步切换文档根元素与正文元素上的主题状态类，以兼容不同样式挂载点。
 *
 * @param className - 待切换的 CSS 类名。
 * @param force - 指定时强制添加或移除；省略时按当前状态切换。
 */
export function toggleDocumentClass(className: string, force?: boolean) {
  // 主题级状态类同时写到 html/body，兼容 Valaxy 与第三方样式的不同挂载点。
  toggleElementClass(getDocumentElement(), className, force)
  toggleElementClass(getDocumentBody(), className, force)
}

/**
 * 从文档根元素与正文元素移除主题状态类，缺少文档时安全跳过。
 *
 * @param className - 待移除的 CSS 类名。
 */
export function removeDocumentClass(className: string) {
  getDocumentElement()?.classList.remove(className)
  getDocumentBody()?.classList.remove(className)
}
