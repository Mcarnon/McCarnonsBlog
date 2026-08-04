import { getWindow } from '../../shared/browser'

/** 创建可由异常名称稳定识别的图片加载取消错误。 */
function createImageAbortError(): Error {
  const error = new Error('Image loading aborted')
  error.name = 'AbortError'
  return error
}

/**
 * 在浏览器中预加载并尽量提前解码图片。
 *
 * 非浏览器环境或 `window.Image` 不可用时直接返回原地址。浏览器触发 `load`
 * 后会尝试调用 `decode`，但解码失败不视为资源加载失败。
 *
 * @param url - 待预加载的图片地址。
 * @param signal - 可选取消信号；取消后会清理监听并尽力停止图片请求。
 * @returns 图片加载成功后的原地址。
 * @throws 浏览器触发图片 `error` 事件时抛出加载错误；取消时抛出名称为 `AbortError` 的异常。
 */
export function preloadImage(url: string, signal?: AbortSignal) {
  return new Promise<string>((resolve, reject) => {
    if (signal?.aborted) {
      reject(createImageAbortError())
      return
    }

    const currentWindow = getWindow()

    if (!currentWindow?.Image) {
      resolve(url)
      return
    }

    const image = new currentWindow.Image()
    let settled = false

    /** 清理图片事件与取消信号监听。 */
    function cleanup(): void {
      image.onload = null
      image.onerror = null
      signal?.removeEventListener('abort', handleAbort)
    }

    /** 取消加载并尽力通知浏览器停止当前图片请求。 */
    function handleAbort(): void {
      if (settled)
        return

      settled = true
      cleanup()

      try {
        image.removeAttribute('src')
      }
      catch {
        // 部分宿主不允许移除图片地址；监听已清理，继续按取消语义收尾。
      }

      reject(createImageAbortError())
    }

    // onload 只能说明资源已经到达浏览器，decode 则尽量把解码阶段前置，
    // 降低切图瞬间出现白闪的概率。
    image.onload = async () => {
      try {
        if (typeof image.decode === 'function')
          await image.decode()
      }
      catch {
        // decode 失败不视为真正的加载失败，否则兼容性问题会被放大成显示问题。
      }

      if (settled)
        return

      if (signal?.aborted) {
        handleAbort()
        return
      }

      settled = true
      cleanup()
      resolve(url)
    }
    image.onerror = () => {
      if (settled)
        return

      settled = true
      cleanup()
      reject(new Error(`Failed to load image: ${url}`))
    }

    signal?.addEventListener('abort', handleAbort, { once: true })

    if (signal?.aborted) {
      handleAbort()
      return
    }

    try {
      image.src = url
    }
    catch (error) {
      settled = true
      cleanup()
      reject(error)
    }
  })
}
