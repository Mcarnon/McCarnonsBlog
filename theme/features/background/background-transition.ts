import type { Ref } from 'vue'
import type { BrowserAnimationFrame, BrowserTimeout } from '../../shared/browser'
import { ref } from 'vue'
import {
  cancelBrowserAnimationFrame,
  clearBrowserTimeout,
  getWindow,
  prefersReducedMotion,
  requestBrowserAnimationFrame,
  setBrowserTimeout,
} from '../../shared/browser'

/** 进场图片挂载后开始显示的延迟，单位为毫秒。 */
const IMAGE_REVEAL_DELAY = 16

/** 新背景图片淡入并提交为稳定图层前的等待时长，单位为毫秒。 */
const IMAGE_FADE_DURATION = 520

/** 背景双图层过渡控制器。 */
export interface BackgroundTransitionController {
  /** 当前稳定显示的图片地址。 */
  currentImageUrl: Ref<string>
  /** 正在淡入的图片地址。 */
  incomingImageUrl: Ref<string>
  /** 进场图片是否已进入可见阶段。 */
  incomingImageVisible: Ref<boolean>
  /** 清空进场图片层及其可见状态。 */
  clearIncomingImage: () => void
  /** 取消待执行的显示、提交定时器与收尾动画帧。 */
  cancelPendingTransition: () => void
  /** 取消待执行任务，并将未完成的进场图片立即提交为稳定图片。 */
  settlePendingTransition: () => void
  /** 立即显示已确认可用的缓存或回退图片。 */
  showProvisionalImage: (url: string) => void
  /** 将目标图片通过双图层淡入后提交为稳定图片。 */
  transitionTo: (url: string) => void
  /** 取消过渡并清空稳定与进场图片层。 */
  reset: () => void
  /** 释放过渡资源并清空未完成的进场图片层。 */
  dispose: () => void
}

/**
 * 创建独占图片图层状态、定时器与动画帧的背景过渡控制器。
 *
 * @returns 可立即显示稳定候选、执行淡入切换并释放视觉资源的控制器。
 */
export function createBackgroundTransition(): BackgroundTransitionController {
  const currentImageUrl = ref('')
  const incomingImageUrl = ref('')
  const incomingImageVisible = ref(false)
  let revealTimer: BrowserTimeout | undefined
  let finalizeTimer: BrowserTimeout | undefined
  let firstPaintFrame: BrowserAnimationFrame | undefined
  let secondPaintFrame: BrowserAnimationFrame | undefined

  /** 清空进场图片层及其可见状态。 */
  function clearIncomingImage(): void {
    incomingImageUrl.value = ''
    incomingImageVisible.value = false
  }

  /** 取消待执行的显示、提交定时器与两次收尾动画帧。 */
  function cancelPendingTransition(): void {
    clearBrowserTimeout(revealTimer)
    clearBrowserTimeout(finalizeTimer)
    cancelBrowserAnimationFrame(firstPaintFrame)
    cancelBrowserAnimationFrame(secondPaintFrame)

    revealTimer = undefined
    finalizeTimer = undefined
    firstPaintFrame = undefined
    secondPaintFrame = undefined
  }

  /** 取消待执行任务，并将未完成的进场图片立即提交为稳定图片。 */
  function settlePendingTransition(): void {
    const pendingImageUrl = incomingImageUrl.value

    cancelPendingTransition()

    if (pendingImageUrl)
      currentImageUrl.value = pendingImageUrl

    clearIncomingImage()
  }

  /**
   * 立即显示已确认可用的缓存或回退图片。
   *
   * @param url - 待作为当前稳定图层显示的图片地址；空地址会重置图片层。
   */
  function showProvisionalImage(url: string): void {
    if (!url) {
      reset()
      return
    }

    cancelPendingTransition()
    currentImageUrl.value = url
    clearIncomingImage()
  }

  /**
   * 将目标图片通过进场图层淡入，并在视觉稳定后提交到当前图层。
   *
   * @param url - 待切换的目标图片地址；空地址会重置图片层。
   */
  function transitionTo(url: string): void {
    cancelPendingTransition()

    if (!url) {
      reset()
      return
    }

    if (currentImageUrl.value === url) {
      clearIncomingImage()
      return
    }

    // 减少动态效果时仍由调用方完成预加载、缓存与轮换，仅跳过视觉淡入阶段。
    if (prefersReducedMotion()) {
      currentImageUrl.value = url
      clearIncomingImage()
      return
    }

    incomingImageUrl.value = url
    incomingImageVisible.value = false

    if (!getWindow()) {
      incomingImageVisible.value = true
      currentImageUrl.value = url
      clearIncomingImage()
      return
    }

    revealTimer = setBrowserTimeout(() => {
      revealTimer = undefined
      incomingImageVisible.value = true
    }, IMAGE_REVEAL_DELAY)

    finalizeTimer = setBrowserTimeout(() => {
      finalizeTimer = undefined
      // 淡入时长结束后额外等待两帧，确保新图已完成合成再移除进场层。
      firstPaintFrame = requestBrowserAnimationFrame(() => {
        firstPaintFrame = undefined
        secondPaintFrame = requestBrowserAnimationFrame(() => {
          secondPaintFrame = undefined
          currentImageUrl.value = url
          clearIncomingImage()
        })
      })
    }, IMAGE_FADE_DURATION)
  }

  /** 取消未完成过渡并清空稳定与进场图片层。 */
  function reset(): void {
    cancelPendingTransition()
    currentImageUrl.value = ''
    clearIncomingImage()
  }

  /** 释放过渡资源并清空未完成的进场图片层。 */
  function dispose(): void {
    cancelPendingTransition()
    clearIncomingImage()
  }

  return {
    currentImageUrl,
    incomingImageUrl,
    incomingImageVisible,
    clearIncomingImage,
    cancelPendingTransition,
    settlePendingTransition,
    showProvisionalImage,
    transitionTo,
    reset,
    dispose,
  }
}
