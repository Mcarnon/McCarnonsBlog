/**
 * 判断异常是否由指定的中止信号触发。
 *
 * 不依赖全局 `DOMException`，兼容该构造器不可用的 SSR、测试与非浏览器环境。
 *
 * @param error - 请求抛出的未知异常。
 * @param signal - 当前请求使用的中止信号。
 * @returns 信号已中止或异常名称为 `AbortError` 时返回 `true`。
 */
export function isAbortError(error: unknown, signal: AbortSignal) {
  return signal.aborted
    || (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError')
}
