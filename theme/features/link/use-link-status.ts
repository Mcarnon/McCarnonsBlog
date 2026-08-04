import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getWindow, isAbortError } from '../../shared/browser'

/** 友链可访问性探测的界面状态。 */
export type LinkStatus = 'idle' | 'checking' | 'online' | 'offline' | 'unknown'

/** 当前浏览器会话内已经完成的友链探测结果。 */
const LINK_STATUS_CACHE = new Map<string, LinkStatus>()

/**
 * 判断目标地址是否能在当前浏览器环境执行 HTTP(S) 探测。
 *
 * @param url - 待检测的友链地址。
 * @returns 浏览器环境存在且地址协议为 HTTP(S) 时返回 `true`。
 */
function canCheckLink(url: string) {
  const currentWindow = getWindow()
  if (!currentWindow)
    return false

  try {
    const target = new URL(url, currentWindow.location.href)
    return target.protocol === 'http:' || target.protocol === 'https:'
  }
  catch {
    return false
  }
}

/**
 * 使用 `no-cors` 探测浏览器是否接受友链请求，HEAD 请求抛错时再尝试 GET。
 * `no-cors` 无法读取真实 HTTP 状态，请求成功兑现不代表响应为 2xx。
 *
 * @param url - 待探测的友链地址。
 * @param signal - 用于取消 HEAD 与 GET 请求的信号。
 * @returns 请求被浏览器接受时返回 `online`，两次请求均抛错时返回 `offline`，非浏览器环境返回 `unknown`。
 * @throws HEAD 或 GET 请求被取消时重新抛出取消异常。
 */
async function probeLink(url: string, signal: AbortSignal): Promise<LinkStatus> {
  if (!getWindow())
    return 'unknown'

  try {
    await fetch(url, {
      cache: 'no-store',
      method: 'HEAD',
      mode: 'no-cors',
      signal,
    })
    return 'online'
  }
  catch (error) {
    if (isAbortError(error, signal))
      throw error

    // HEAD 请求因非取消原因抛错后继续使用 GET 探测。
  }

  try {
    await fetch(url, {
      cache: 'no-store',
      method: 'GET',
      mode: 'no-cors',
      signal,
    })
    return 'online'
  }
  catch (error) {
    if (isAbortError(error, signal))
      throw error

    return 'offline'
  }
}

/**
 * 在组件挂载后按需探测友链状态，并复用当前会话内已经完成的结果。
 *
 * @param url - 返回当前友链地址的 Getter。
 * @param enabled - 返回是否启用状态检测的 Getter。
 * @returns 对禁用状态做空闲回退的响应式友链状态。
 */
export function useLinkStatus(url: () => string, enabled: () => boolean) {
  const status = ref<LinkStatus>('idle')
  let activeController: AbortController | undefined
  let checkGeneration = 0
  let isMounted = false
  let isUnmounted = false
  let stopLinkWatch: (() => void) | undefined

  const visibleStatus = computed(() => {
    if (!enabled())
      return 'idle'

    return status.value
  })

  /**
   * 检查当前友链地址，并仅在地址、开关和组件生命周期仍匹配时提交结果。
   *
   * @param targetUrl - 本轮检查捕获的友链地址。
   * @param isEnabled - 本轮检查捕获的启用状态。
   */
  async function checkLinkStatus(targetUrl: string, isEnabled: boolean) {
    activeController?.abort()
    activeController = undefined
    const currentGeneration = ++checkGeneration

    if (!isMounted || isUnmounted)
      return

    if (!isEnabled) {
      status.value = 'idle'
      return
    }

    if (!canCheckLink(targetUrl)) {
      status.value = 'unknown'
      return
    }

    const cachedStatus = LINK_STATUS_CACHE.get(targetUrl)
    if (cachedStatus) {
      status.value = cachedStatus
      return
    }

    const controller = new AbortController()
    activeController = controller
    status.value = 'checking'

    /** 判断当前异步探测是否仍拥有状态与缓存提交资格。 */
    const isCurrentCheck = () => currentGeneration === checkGeneration
      && controller === activeController
      && isMounted
      && !isUnmounted
      && enabled()
      && url() === targetUrl

    try {
      const nextStatus = await probeLink(targetUrl, controller.signal)
      if (!isCurrentCheck())
        return

      LINK_STATUS_CACHE.set(targetUrl, nextStatus)
      status.value = nextStatus
    }
    catch (error) {
      if (!isAbortError(error, controller.signal) && isCurrentCheck())
        status.value = 'offline'
    }
    finally {
      if (currentGeneration === checkGeneration && controller === activeController)
        activeController = undefined
    }
  }

  onMounted(() => {
    isMounted = true
    stopLinkWatch = watch(
      [url, enabled],
      ([targetUrl, isEnabled]) => void checkLinkStatus(targetUrl, isEnabled),
      { immediate: true },
    )
  })

  onBeforeUnmount(() => {
    isUnmounted = true
    isMounted = false
    checkGeneration += 1
    activeController?.abort()
    activeController = undefined
    stopLinkWatch?.()
    stopLinkWatch = undefined
  })

  return {
    status: visibleStatus,
  }
}
