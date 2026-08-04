import type { BrowserTimeout } from './runtime'
import { clearBrowserTimeout, getWindow, setBrowserTimeout } from './runtime'

/** 可被限流包装的任意函数签名，保留调用上下文、参数与返回值类型。 */
type AnyFunction = (this: any, ...args: any[]) => any

/** 防抖与节流函数共用的执行策略。 */
export interface RateLimitOptions {
  /** 是否在一轮等待开始时立即执行。 */
  leading?: boolean
  /** 是否在一轮等待结束时使用最后一次参数执行。 */
  trailing?: boolean
  /** 持续触发时允许延迟执行的最长毫秒数。 */
  maxWait?: number
  /** 用于取消后续调度的中止信号。 */
  signal?: AbortSignal
}

/** 限流函数暴露的生命周期控制能力。 */
export interface RateLimitedControls<T = unknown> {
  /** 取消待执行调用并清理计时器。 */
  cancel: () => void
  /** 立即执行待处理调用并返回最近一次结果。 */
  flush: () => T | undefined
  /** 判断当前是否存在待结束的计时周期。 */
  pending: () => boolean
}

/**
 * 保留原函数调用签名并附带控制方法的限流函数类型。
 *
 * @typeParam T - 被包装的原始函数类型。
 */
export type RateLimitedFunction<T extends AnyFunction> = ((
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T> | undefined) & RateLimitedControls<ReturnType<T>>

/**
 * 创建支持首触发、尾触发、最长等待和中止信号的防抖函数。
 *
 * @remarks
 * 浏览器环境通过定时器合并连续调用，并在首触发前建立当前计时周期，使处理器
 * 重入、取消或中止时能够观察并清理该周期。SSR 环境无法调度时同步落地尾触发，
 * 避免待处理状态永久悬挂。尾触发始终使用最后一次调用的上下文与参数。
 *
 * @typeParam T - 被包装的函数类型。
 * @param handler - 实际执行的目标函数。
 * @param wait - 连续调用之间的等待毫秒数，负值按零处理。
 * @param options - 首尾触发、最长等待与中止策略。
 * @returns 保留目标函数签名并提供取消、立即执行和状态查询能力的函数。
 */
export function createDebouncedFunction<T extends AnyFunction>(
  handler: T,
  wait = 0,
  options: RateLimitOptions = {},
): RateLimitedFunction<T> {
  const { leading = false, trailing = true, signal } = options
  const delay = Math.max(0, wait)
  const maxWait = typeof options.maxWait === 'number' ? Math.max(0, options.maxWait) : undefined

  let timer: BrowserTimeout | undefined
  let maxTimer: BrowserTimeout | undefined
  let lastInvoke: (() => ReturnType<T>) | undefined
  let lastResult: ReturnType<T> | undefined

  /** 清理普通等待与最长等待计时器，并恢复空闲状态。 */
  function resetTimers() {
    clearBrowserTimeout(timer)
    clearBrowserTimeout(maxTimer)
    timer = undefined
    maxTimer = undefined
  }

  /** 执行最后一次待处理调用，确保尾触发使用最新上下文与参数。 */
  function invoke() {
    if (!lastInvoke || signal?.aborted)
      return lastResult

    // 始终执行最后一次调用参数，保证 trailing 场景拿到最新用户输入。
    const invokePending = lastInvoke
    lastInvoke = undefined
    lastResult = invokePending()

    return lastResult
  }

  /** 结束当前等待周期，并按尾触发策略执行或丢弃待处理调用。 */
  function finish() {
    resetTimers()

    if (trailing) {
      invoke()
    }
    else {
      lastInvoke = undefined
    }
  }

  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (signal?.aborted)
      return lastResult

    const shouldInvokeLeading = leading && !timer && !maxTimer
    const currentWindow = getWindow()
    lastInvoke = () => handler.apply(this, args)

    if (!currentWindow) {
      // SSR/测试环境没有计时器时同步执行可落地的触发，避免状态永久 pending。
      if (shouldInvokeLeading || trailing)
        invoke()

      return lastResult
    }

    clearBrowserTimeout(timer)
    timer = setBrowserTimeout(finish, delay)

    if (maxWait !== undefined && !maxTimer)
      maxTimer = setBrowserTimeout(finish, maxWait)

    // 先建立周期，确保处理器重入、取消或中止时能清理当前计时器。
    if (shouldInvokeLeading)
      invoke()

    return lastResult
  } as RateLimitedFunction<T>

  debounced.cancel = () => {
    resetTimers()
    lastInvoke = undefined
  }

  debounced.flush = () => {
    if (!debounced.pending())
      return lastResult

    finish()
    return lastResult
  }

  debounced.pending = () => Boolean(timer || maxTimer)

  signal?.addEventListener('abort', debounced.cancel, { once: true })

  return debounced
}

/**
 * 创建默认首尾均触发的节流函数，持续触发时按等待间隔强制执行。
 *
 * @remarks
 * 该实现复用防抖函数的 `maxWait` 语义，使节流与防抖共享一致的取消、
 * 立即执行、AbortSignal 和 SSR 行为。
 *
 * @typeParam T - 被包装的函数类型。
 * @param handler - 实际执行的目标函数。
 * @param wait - 两次强制执行之间的等待毫秒数。
 * @param options - 首尾触发与中止策略。
 * @returns 具备限流控制能力的节流函数。
 */
export function createThrottledFunction<T extends AnyFunction>(
  handler: T,
  wait = 0,
  options: Omit<RateLimitOptions, 'maxWait'> = {},
): RateLimitedFunction<T> {
  // throttle 复用 debounce 的 maxWait 语义，确保持续触发时也会按节流间隔执行。
  return createDebouncedFunction(handler, wait, {
    leading: true,
    trailing: true,
    ...options,
    maxWait: wait,
  })
}
