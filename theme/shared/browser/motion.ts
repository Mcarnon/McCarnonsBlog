import { onBeforeUnmount, onMounted, readonly, ref } from 'vue'
import { getWindow } from './runtime'

/** 系统“减少动态效果”偏好使用的唯一媒体查询。 */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * 判断当前浏览器是否启用了“减少动态效果”偏好。
 *
 * @returns 浏览器匹配减少动态效果查询时返回 `true`；SSR、API 不可用或查询异常时返回 `false`。
 */
export function prefersReducedMotion(): boolean {
  const currentWindow = getWindow()
  if (!currentWindow || typeof currentWindow.matchMedia !== 'function')
    return false

  try {
    return currentWindow.matchMedia(REDUCED_MOTION_QUERY).matches
  }
  catch {
    return false
  }
}

/**
 * 获取会随系统设置变化而更新的“减少动态效果”偏好。
 *
 * SSR 与客户端 setup 阶段均固定以 `false` 起步，保证 hydration 初始输出一致；
 * 组件挂载后再读取并监听媒体查询，卸载时释放监听。
 *
 * @returns 只读的响应式减少动态效果状态。
 */
export function useReducedMotion() {
  const reducedMotion = ref(false)
  let mediaQuery: MediaQueryList | undefined

  /** 将媒体查询结果同步到响应式状态。 */
  function syncPreference(event: MediaQueryListEvent | MediaQueryList) {
    reducedMotion.value = event.matches
  }

  onMounted(() => {
    const currentWindow = getWindow()
    if (!currentWindow || typeof currentWindow.matchMedia !== 'function')
      return

    try {
      mediaQuery = currentWindow.matchMedia(REDUCED_MOTION_QUERY)
      syncPreference(mediaQuery)
    }
    catch {
      mediaQuery = undefined
      return
    }

    if (typeof mediaQuery.addEventListener === 'function')
      mediaQuery.addEventListener('change', syncPreference)
    else if (typeof mediaQuery.addListener === 'function')
      mediaQuery.addListener(syncPreference)
  })

  onBeforeUnmount(() => {
    if (typeof mediaQuery?.removeEventListener === 'function')
      mediaQuery.removeEventListener('change', syncPreference)
    else if (typeof mediaQuery?.removeListener === 'function')
      mediaQuery.removeListener(syncPreference)

    mediaQuery = undefined
  })

  return readonly(reducedMotion)
}
