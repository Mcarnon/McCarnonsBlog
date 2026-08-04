import type { BackgroundScope, ResolvedBackground } from './types'
import { useColorMode, useWindowSize } from '@vueuse/core'
import { computed } from 'vue'
import { useThemeConfig } from '../../shared/config'
import { resolveBackground } from './resolve-background'

/**
 * 创建随主题配置、色彩模式与窗口宽度更新的背景解析结果。
 *
 * 该组合式函数只读取响应式环境并委托纯解析器，不承担图片预加载、过渡、
 * 缓存或轮换职责。
 *
 * @param scope - 背景生效范围，默认为全局应用背景。
 * @returns 当前环境对应的只读响应式背景解析结果。
 */
export function useResolvedBackground(scope: BackgroundScope = 'app') {
  const themeConfig = useThemeConfig()
  const colorMode = useColorMode()
  const { width } = useWindowSize()

  return computed<ResolvedBackground>(() => resolveBackground({
    scope,
    background: themeConfig.value.background,
    heroCover: themeConfig.value.hero?.cover,
    isDark: colorMode.value === 'dark',
    isMobile: width.value < 768,
  }))
}
