import type { ThemeConfig } from '../../types'
import { useConfig } from 'valaxy'
import { computed } from 'vue'

/**
 * 获取当前 Valaxy 实例中的主题配置响应式引用。
 *
 * @remarks
 * 该函数是所有客户端功能读取主题配置的统一入口。返回计算引用而不是配置快照，
 * 以便主题配置变化后由 Vue 自动更新消费者。
 *
 * @typeParam T - 主题配置的具体类型，默认使用 Lolimeow 的 `ThemeConfig`。
 * @returns 指向当前主题配置的只读计算引用。
 */
export function useThemeConfig<T = ThemeConfig>() {
  const config = useConfig<T>()
  return computed(() => config!.value.themeConfig)
}
