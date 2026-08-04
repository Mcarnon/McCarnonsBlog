import { readonly, shallowRef } from 'vue'

/** 首页历史恢复状态允许保留的最大条目数。 */
const MAX_HOME_HISTORY_ENTRIES = 32

/** 写入 Router history state 的主题私有条目键字段。 */
const HOME_HISTORY_ENTRY_KEY = '__lmHomeHistoryEntryKey'

/** 单个浏览器历史条目对应的首页文章流状态。 */
interface HomeHistoryState {
  /** 文章流身份，用于拒绝恢复过期或不兼容的列表状态。 */
  feedIdentity: string
  /** 无限滚动已经展开的页数。 */
  visiblePageCount: number
}

/** 首页历史恢复与滚动行为之间共享的握手状态。 */
interface HomeHistoryRestorationState {
  /** 每次目标首页导航单调递增的代次。 */
  generation: number
  /** 当前代次是否仍禁止 IntersectionObserver 增页。 */
  pending: boolean
  /** 当前代次对应的标准化路由位置。 */
  routeLocation: string
}

/** 当前浏览器会话内按历史条目隔离的首页状态。 */
const homeHistoryStates = new Map<string, HomeHistoryState>()

/** 首页文章流与滚动行为共享的恢复握手源。 */
const homeHistoryRestorationSource = shallowRef<HomeHistoryRestorationState>({
  generation: 0,
  pending: false,
  routeLocation: '',
})

/** 供首页文章流只读监听的历史恢复握手状态。 */
export const homeHistoryRestorationState = readonly(homeHistoryRestorationSource)

/**
 * 创建只需在当前页面会话内保持唯一的历史条目键。
 */
function createHomeHistoryEntryKey() {
  if (typeof window.crypto?.randomUUID === 'function')
    return window.crypto.randomUUID()

  return `${Date.now().toString(36)}:${Math.random().toString(36).slice(2)}`
}

/**
 * 构建 replaceState 失败时使用的稳定位置维度。
 *
 * @param routeLocation - Vue Router 当前标准化路由位置。
 * @returns 同时包含当前 route 与浏览器 URL 的稳定字符串。
 */
function resolveStableLocation(routeLocation?: string) {
  const currentUrl = typeof window === 'undefined'
    ? ''
    : `${window.location.pathname}${window.location.search}${window.location.hash}`

  return JSON.stringify({
    route: routeLocation ?? '',
    url: currentUrl,
  })
}

/**
 * 从 Router 使用的 history state 中提取可用降级条目键。
 *
 * @param historyState - 浏览器历史条目附带的状态对象。
 * @param routeLocation - Vue Router 当前标准化路由位置。
 * @returns 带当前 route/URL 维度的降级键；缺少可用 key/position 时返回 undefined。
 */
function resolveHistoryEntryKey(
  historyState: Record<string, unknown>,
  routeLocation?: string,
): string | undefined {
  const stableLocation = resolveStableLocation(routeLocation)
  const key = historyState.key

  if (typeof key === 'string' && key.length > 0)
    return `router-key:${key}:${stableLocation}`

  const position = historyState.position

  if (
    (typeof position === 'number' && Number.isFinite(position))
    || (typeof position === 'string' && position.length > 0)
  ) {
    return `position:${position}:${stableLocation}`
  }

  return undefined
}

/**
 * 获取当前激活的浏览器历史条目键，并在 Router 未提供唯一 key 时补充主题私有 key。
 *
 * @remarks
 * replaceState 合并保留 Router 原状态与当前 URL；同条目的 replace/back/forward 会继续携带该 key，
 * 新 push 条目不会继承它。若浏览器拒绝 replaceState，则使用 Router key/position 与当前 route/URL
 * 组合降级，减少不同位置复用同一 position 时的误命中，同时不改变浏览器历史栈。
 *
 * @param routeLocation - Vue Router 当前标准化路由位置，用于增强失败降级键的稳定性。
 * @returns 当前条目键；SSR 或历史状态不可识别时返回 undefined。
 */
export function captureActiveHomeHistoryEntryKey(routeLocation?: string): string | undefined {
  if (typeof window === 'undefined')
    return undefined

  const state = window.history.state

  if (!state || typeof state !== 'object')
    return undefined

  const historyState = state as Record<string, unknown>
  const existingHomeEntryKey = historyState[HOME_HISTORY_ENTRY_KEY]

  if (typeof existingHomeEntryKey === 'string' && existingHomeEntryKey.length > 0)
    return `key:${existingHomeEntryKey}`

  const homeEntryKey = createHomeHistoryEntryKey()

  try {
    window.history.replaceState({
      ...historyState,
      [HOME_HISTORY_ENTRY_KEY]: homeEntryKey,
    }, '')

    return `key:${homeEntryKey}`
  }
  catch {
    return resolveHistoryEntryKey(historyState, routeLocation)
  }
}

/**
 * 开始一轮目标首页导航的恢复握手。
 *
 * @remarks
 * 新代次会自然使旧代次的完成信号失效；文章流据此立即暂停 IntersectionObserver 增页。
 *
 * @param routeLocation - 目标首页的标准化路由位置。
 * @returns 本轮恢复代次，供 scrollBehavior 精确完成对应握手。
 */
export function beginHomeHistoryRestoration(routeLocation: string) {
  const generation = homeHistoryRestorationSource.value.generation + 1

  homeHistoryRestorationSource.value = {
    generation,
    pending: true,
    routeLocation,
  }

  return generation
}

/**
 * 完成或取消指定代次的首页历史恢复握手。
 *
 * @param generation - 开始恢复时取得的代次。
 * @returns 仅当前仍待处理的同代次被释放时返回 true。
 */
export function settleHomeHistoryRestoration(generation: number) {
  const currentState = homeHistoryRestorationSource.value

  if (!currentState.pending || currentState.generation !== generation)
    return false

  homeHistoryRestorationSource.value = {
    ...currentState,
    pending: false,
  }

  return true
}

/**
 * 以最近使用顺序保存首页状态，并将缓存容量限制在固定上限内。
 *
 * @param entryKey - 当前首页历史条目键。
 * @param state - 当前文章流身份与可见页数。
 */
function setHomeHistoryState(entryKey: string, state: HomeHistoryState) {
  homeHistoryStates.delete(entryKey)
  homeHistoryStates.set(entryKey, state)

  while (homeHistoryStates.size > MAX_HOME_HISTORY_ENTRIES) {
    const oldestEntryKey = homeHistoryStates.keys().next().value

    if (oldestEntryKey === undefined)
      break

    homeHistoryStates.delete(oldestEntryKey)
  }
}

/**
 * 在文章流创建或历史条目切换期间读取可恢复状态。
 *
 * 同一浏览器历史条目的主题 key 保持稳定，push 会得到新条目键；刷新后内存缓存为空。
 * 文章流身份不一致时会清理该条目，避免恢复过期或不兼容的列表状态。
 *
 * @param entryKey - 当前浏览器历史条目键。
 * @param feedIdentity - 当前文章稳定 ID、顺序与分页关键配置组成的身份。
 * @returns 可恢复的可见页数；不满足恢复条件时返回 undefined。
 */
export function consumeHomeHistoryPageCount(
  entryKey: string | undefined,
  feedIdentity: string,
): number | undefined {
  if (!entryKey)
    return undefined

  const state = homeHistoryStates.get(entryKey)

  if (!state)
    return undefined

  if (state.feedIdentity !== feedIdentity) {
    homeHistoryStates.delete(entryKey)
    return undefined
  }

  setHomeHistoryState(entryKey, state)
  return state.visiblePageCount
}

/**
 * 将首页无限滚动进度持续写入当前激活的历史条目。
 *
 * @param entryKey - 当前激活的首页历史条目键。
 * @param feedIdentity - 当前文章流身份。
 * @param visiblePageCount - 当前已经展开的页数。
 */
export function saveHomeHistoryPageCount(
  entryKey: string | undefined,
  feedIdentity: string,
  visiblePageCount: number,
) {
  if (!entryKey)
    return

  const normalizedPageCount = Math.max(1, Math.floor(visiblePageCount))

  setHomeHistoryState(entryKey, {
    feedIdentity,
    visiblePageCount: normalizedPageCount,
  })
}
