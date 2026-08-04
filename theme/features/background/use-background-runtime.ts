import type { CSSProperties, Ref } from 'vue'
import type { BackgroundScope, ResolvedBackground } from './types'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { getWindow, useReducedMotion } from '../../shared/browser'
import { cacheBackgroundImage, getCachedBackgroundImage, getStableFallbackImage } from './background-cache'
import { getBackgroundCacheKey, shouldUseTransparentFallback } from './background-image'
import { createBackgroundRotationScheduler } from './background-rotation'
import { createBackgroundTransition } from './background-transition'
import { preloadImage } from './image-loader'

/** 背景运行时的首屏显示策略选项。 */
interface BackgroundRuntimeOptions {
  /**
   * 当首屏依赖随机 API 图时，先保持透明并直接穿透到底层全局背景，
   * 避免 Hero 的静态回退图与全局背景叠出“双层同图”。
   */
  transparentUntilLoaded?: boolean
}

/**
 * 管理解析后背景的图片预加载、缓存、失败回退与请求世代。
 *
 * 图片图层和视觉过渡由过渡控制器持有，递归轮换由轮换调度器持有；运行时
 * 只编排两者并维护加载、成功与回退状态。
 *
 * @param scope - 当前背景生效范围，用于隔离缓存键与稳定回退。
 * @param resolvedBackground - 当前作用域的只读响应式背景解析结果。
 * @param options - 首屏透明等待策略。
 * @returns 当前图层、进场图层、占位样式以及加载和回退状态共七个响应式字段。
 */
export function useBackgroundRuntime(
  scope: BackgroundScope,
  resolvedBackground: Readonly<Ref<ResolvedBackground>>,
  options: BackgroundRuntimeOptions = {},
) {
  const transition = createBackgroundTransition()
  const reducedMotion = useReducedMotion()
  const isLoading = ref(false)
  const hasLoaded = ref(false)
  const usingFallback = ref(false)
  let requestId = 0

  const placeholderStyle = computed<CSSProperties>(() => {
    const resolved = resolvedBackground.value

    if (resolved.type === 'gradient' && resolved.gradientValue) {
      return {
        backgroundImage: resolved.gradientValue,
      }
    }

    return {
      backgroundColor: resolved.colorValue || 'var(--lm-c-bg-base)',
    }
  })

  watch(reducedMotion, (shouldReduceMotion) => {
    if (shouldReduceMotion)
      transition.settlePendingTransition()
  })

  const rotation = createBackgroundRotationScheduler({
    scope,
    isCurrentRequest: currentRequestId => currentRequestId === requestId,
    commit: (url) => {
      transition.transitionTo(url)
      hasLoaded.value = true
      usingFallback.value = false
    },
    onPause: () => {
      transition.settlePendingTransition()
    },
    handleFailure: () => {
      transition.clearIncomingImage()
      usingFallback.value = true
    },
  })

  watch(
    () => resolvedBackground.value,
    async (next) => {
      requestId += 1
      const currentRequestId = requestId
      rotation.stop()
      transition.cancelPendingTransition()

      if (next.type !== 'image' || !next.imageUrl) {
        transition.reset()
        isLoading.value = false
        hasLoaded.value = false
        usingFallback.value = false
        return
      }

      const cacheKey = getBackgroundCacheKey(scope, next)
      const cachedUrl = getCachedBackgroundImage(cacheKey)
      const fallbackImageUrl = getStableFallbackImage(scope, next)
      const transparentUntilLoaded = shouldUseTransparentFallback(next, options)

      if (cachedUrl) {
        transition.showProvisionalImage(cachedUrl)
        hasLoaded.value = true
        usingFallback.value = true
      }
      else if (!transparentUntilLoaded && fallbackImageUrl) {
        transition.showProvisionalImage(fallbackImageUrl)
        hasLoaded.value = true
        usingFallback.value = true
      }
      else {
        transition.reset()
        hasLoaded.value = false
        usingFallback.value = true
      }

      // SSR/SSG 只输出稳定回退；客户端预加载不能提前改变 HTML，避免 hydration 不一致。
      if (!getWindow()) {
        isLoading.value = false
        return
      }

      isLoading.value = true

      try {
        const loadedUrl = await preloadImage(next.imageUrl)

        if (currentRequestId !== requestId)
          return

        transition.transitionTo(loadedUrl)
        cacheBackgroundImage(cacheKey, loadedUrl)
        hasLoaded.value = true
        usingFallback.value = false
      }
      catch {
        if (currentRequestId !== requestId)
          return

        transition.clearIncomingImage()
        usingFallback.value = true
      }
      finally {
        if (currentRequestId === requestId) {
          isLoading.value = false
          rotation.schedule(next, currentRequestId)
        }
      }
    },
    { immediate: true, deep: true },
  )

  onBeforeUnmount(() => {
    requestId += 1
    rotation.stop()
    transition.dispose()
  })

  return {
    currentImageUrl: transition.currentImageUrl,
    incomingImageUrl: transition.incomingImageUrl,
    incomingImageVisible: transition.incomingImageVisible,
    placeholderStyle,
    isLoading,
    hasLoaded,
    usingFallback,
  }
}
