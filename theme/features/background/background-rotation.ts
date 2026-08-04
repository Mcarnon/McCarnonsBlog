import type { BrowserTimeout } from '../../shared/browser'
import type { BackgroundScope, ResolvedBackground } from './types'
import { clearBrowserTimeout, getDocument, getWindow, isAbortError, setBrowserTimeout } from '../../shared/browser'
import { cacheBackgroundImage } from './background-cache'
import { getBackgroundCacheKey, getRotationCandidate } from './background-image'
import { preloadImage } from './image-loader'

/** 随机背景轮换允许的最短间隔，单位为毫秒。 */
const MIN_ROTATION_INTERVAL = 4000

/** 背景轮换调度器的依赖与回调选项。 */
export interface BackgroundRotationSchedulerOptions {
  /** 背景生效范围，用于隔离成功图片缓存。 */
  scope: BackgroundScope
  /** 判断指定请求世代是否仍为当前有效世代。 */
  isCurrentRequest: (requestId: number) => boolean
  /** 提交已完成预加载的轮换图片。 */
  commit: (url: string, background: ResolvedBackground) => void
  /** 页面隐藏暂停轮换时取消尚未完成的视觉过渡。 */
  onPause: () => void
  /** 处理当前世代的轮换图片加载失败。 */
  handleFailure: () => void
}

/** 递归安排随机背景轮换的调度器。 */
export interface BackgroundRotationScheduler {
  /** 根据背景快照与请求世代安排下一次轮换。 */
  schedule: (background: ResolvedBackground, requestId: number) => void
  /** 幂等停止当前唯一的轮换定时器，并使在途轮换任务失效。 */
  stop: () => void
}

/**
 * 创建独占唯一轮换定时器的背景调度器。
 *
 * 每轮调度都校验调度世代与请求世代；仅两个世代均有效时可以提交、回退、
 * 缓存并继续安排下一轮，避免已停止或旧配置的异步结果回写背景状态。
 *
 * @param options - 请求世代判断、提交与失败处理依赖。
 * @returns 可递归排程并幂等停止的背景轮换调度器。
 */
export function createBackgroundRotationScheduler(
  options: BackgroundRotationSchedulerOptions,
): BackgroundRotationScheduler {
  let rotationTimer: BrowserTimeout | undefined
  let activeLoadController: AbortController | undefined
  let visibilityDocument: Document | undefined
  let visibilityListener: (() => void) | undefined
  let scheduleGeneration = 0
  let visibilityGeneration = 0

  /**
   * 判断轮换任务的调度世代与请求世代是否仍同时有效。
   *
   * @param requestId - 启动轮换时的请求世代标识。
   * @param generation - 启动本轮调度时捕获的调度世代。
   * @returns 两个世代均为当前有效世代时返回 true。
   */
  function isScheduleActive(requestId: number, generation: number): boolean {
    return generation === scheduleGeneration && options.isCurrentRequest(requestId)
  }

  /** 清除当前唯一的轮换定时器。 */
  function clearRotationTimer(): void {
    clearBrowserTimeout(rotationTimer)
    rotationTimer = undefined
  }

  /** 取消当前轮换图片加载，并立即释放控制器所有权。 */
  function abortActiveLoad(): void {
    const controller = activeLoadController
    activeLoadController = undefined
    controller?.abort()
  }

  /** 移除当前调度生命周期注册的页面可见性监听。 */
  function removeVisibilityListener(): void {
    if (visibilityDocument && visibilityListener)
      visibilityDocument.removeEventListener('visibilitychange', visibilityListener)

    visibilityDocument = undefined
    visibilityListener = undefined
  }

  /** 幂等停止当前唯一的轮换定时器，并使在途轮换任务失效。 */
  function stop(): void {
    scheduleGeneration += 1
    visibilityGeneration += 1
    clearRotationTimer()
    abortActiveLoad()
    removeVisibilityListener()
  }

  /**
   * 根据背景快照与请求世代安排下一次轮换。
   *
   * 页面隐藏时仅保留当前调度上下文，不启动候选加载；恢复可见后重新等待
   * 一个完整轮换间隔。隐藏期间失效的在途任务不得提交或续排。
   *
   * @param background - 启动轮换时的背景解析快照。
   * @param requestId - 启动轮换时的请求世代标识。
   */
  function schedule(background: ResolvedBackground, requestId: number): void {
    stop()
    const currentGeneration = scheduleGeneration

    if (
      !background.random
      || !background.rotationEnabled
      || !getWindow()
      || !isScheduleActive(requestId, currentGeneration)
    ) {
      return
    }

    const currentDocument = getDocument()

    if (!currentDocument)
      return

    const rotationDocument: Document = currentDocument
    const rotationInterval = Math.max(background.rotationInterval, MIN_ROTATION_INTERVAL)

    /**
     * 判断单次轮换尝试是否仍处于当前调度、请求和可见性世代。
     *
     * @param attemptVisibilityGeneration - 本次轮换开始时捕获的可见性世代。
     * @returns 本次尝试仍可安全提交并续排时返回 true。
     */
    function isAttemptActive(attemptVisibilityGeneration: number): boolean {
      return isScheduleActive(requestId, currentGeneration)
        && attemptVisibilityGeneration === visibilityGeneration
        && rotationDocument.visibilityState !== 'hidden'
    }

    /**
     * 在宿主支持时创建图片加载取消控制器。
     *
     * 不支持 `AbortController` 的旧浏览器继续依赖调度与可见性世代阻止旧结果提交，
     * 仅放弃对底层图片请求的真实取消。
     *
     * @returns 可用的取消控制器；宿主不支持时返回 `undefined`。
     */
    function createLoadController(): AbortController | undefined {
      if (typeof AbortController === 'undefined')
        return undefined

      return new AbortController()
    }

    /** 在页面可见且当前调度有效时，按完整间隔安排下一轮。 */
    function scheduleNextRotation(): void {
      clearRotationTimer()
      abortActiveLoad()

      if (!isScheduleActive(requestId, currentGeneration) || rotationDocument.visibilityState === 'hidden')
        return

      const attemptVisibilityGeneration = visibilityGeneration

      rotationTimer = setBrowserTimeout(() => {
        rotationTimer = undefined
        void runRotationAttempt(attemptVisibilityGeneration).catch(() => {
          try {
            abortActiveLoad()

            if (isAttemptActive(attemptVisibilityGeneration))
              scheduleNextRotation()
          }
          catch {
            // 定时器入口兜底吞掉未知异常，避免产生未处理的 Promise rejection。
          }
        })
      }, rotationInterval)
    }

    /**
     * 执行单次轮换，并分别隔离加载、提交、缓存与失败回调异常。
     *
     * @param attemptVisibilityGeneration - 本次轮换捕获的可见性世代。
     */
    async function runRotationAttempt(attemptVisibilityGeneration: number): Promise<void> {
      if (!isAttemptActive(attemptVisibilityGeneration))
        return

      const nextUrl = getRotationCandidate(background)

      if (!isAttemptActive(attemptVisibilityGeneration))
        return

      if (!nextUrl) {
        scheduleNextRotation()
        return
      }

      const loadController = createLoadController()
      activeLoadController = loadController
      let loadedUrl: string

      try {
        loadedUrl = await preloadImage(nextUrl, loadController?.signal)
      }
      catch (error) {
        const ownsLoad = activeLoadController === loadController
        const loadWasAborted = loadController
          ? isAbortError(error, loadController.signal)
          : false

        if (!ownsLoad || !isAttemptActive(attemptVisibilityGeneration) || loadWasAborted) {
          if (ownsLoad)
            activeLoadController = undefined
          return
        }

        activeLoadController = undefined

        try {
          options.handleFailure()
        }
        catch {
          // 失败回调异常不能逃逸到异步定时器，也不能阻断后续轮换。
        }

        if (isAttemptActive(attemptVisibilityGeneration))
          scheduleNextRotation()
        return
      }

      if (activeLoadController !== loadController || !isAttemptActive(attemptVisibilityGeneration))
        return

      activeLoadController = undefined

      try {
        options.commit(loadedUrl, background)
      }
      catch {
        // 提交异常不属于图片加载失败，不触发加载失败回退。
        if (isAttemptActive(attemptVisibilityGeneration))
          scheduleNextRotation()
        return
      }

      if (!isAttemptActive(attemptVisibilityGeneration))
        return

      try {
        cacheBackgroundImage(getBackgroundCacheKey(options.scope, background), loadedUrl)
      }
      catch {
        // 缓存失败不影响已经完成的视觉提交与后续轮换。
      }

      if (isAttemptActive(attemptVisibilityGeneration))
        scheduleNextRotation()
    }

    visibilityDocument = rotationDocument
    visibilityListener = () => {
      if (!isScheduleActive(requestId, currentGeneration))
        return

      if (rotationDocument.visibilityState === 'hidden') {
        visibilityGeneration += 1
        clearRotationTimer()
        abortActiveLoad()

        try {
          options.onPause()
        }
        catch {
          // 暂停回调异常不能逃逸原生可见性监听器，隐藏状态仍保持已取消。
        }
        return
      }

      scheduleNextRotation()
    }
    rotationDocument.addEventListener('visibilitychange', visibilityListener)
    scheduleNextRotation()
  }

  return {
    schedule,
    stop,
  }
}
