import type { BrowserTimeout } from '../../shared/browser'
import type { TypewriterRenderOptions } from './types'
import { onBeforeUnmount, ref, watch } from 'vue'
import { clearBrowserTimeout, getWindow, setBrowserTimeout, useReducedMotion } from '../../shared/browser'

/**
 * 创建供 Hero 文案复用的逐字渲染状态。
 *
 * 计时器清理、SSR 立即渲染与切换文本时的中断均由该组合式函数统一处理。
 *
 * @returns 当前渲染文本，以及开始和停止渲染的方法。
 */
export function useTypewriter() {
  /** 当前已经显示的文本片段。 */
  const renderedText = ref('')
  const reducedMotion = useReducedMotion()
  let timer: BrowserTimeout | undefined
  let renderGeneration = 0
  let activeRender: { generation: number, options: TypewriterRenderOptions } | undefined

  /** 停止当前逐字渲染并释放对应计时器。 */
  function stop() {
    renderGeneration += 1
    activeRender = undefined
    clearBrowserTimeout(timer)
    timer = undefined
  }

  /**
   * 以同一完成出口落地全文，确保每个渲染代际最多触发一次完成回调。
   *
   * @param generation - 本次渲染捕获的代际标识。
   */
  function complete(generation: number) {
    if (!activeRender || activeRender.generation !== generation)
      return

    const { options } = activeRender
    activeRender = undefined
    clearBrowserTimeout(timer)
    timer = undefined
    renderedText.value = options.text
    options.onComplete?.()
  }

  /**
   * 按指定速度渲染文本；重复调用时会先停止上一段文本。
   *
   * @param options - 本次文本、速度、立即渲染开关和完成回调。
   */
  function render(options: TypewriterRenderOptions) {
    stop()

    const generation = renderGeneration
    activeRender = { generation, options }

    // SSR、调用方要求立即渲染或系统偏好减少动态效果时，仍保留完成回调与轮播排程语义。
    if (options.immediate || reducedMotion.value || !getWindow() || !options.text) {
      complete(generation)
      return
    }

    let visibleLength = 0
    renderedText.value = ''

    /** 显示下一个字符，并在文本完成后触发回调。 */
    const step = () => {
      if (!activeRender || activeRender.generation !== generation)
        return

      visibleLength += 1
      renderedText.value = options.text.slice(0, visibleLength)

      if (visibleLength < options.text.length) {
        timer = setBrowserTimeout(step, options.speed)
        return
      }

      complete(generation)
    }

    timer = setBrowserTimeout(step, options.speed)
  }

  watch(reducedMotion, (reduced) => {
    if (reduced && activeRender)
      complete(activeRender.generation)
  }, { flush: 'sync' })

  onBeforeUnmount(stop)

  return {
    render,
    renderedText,
    stop,
  }
}
