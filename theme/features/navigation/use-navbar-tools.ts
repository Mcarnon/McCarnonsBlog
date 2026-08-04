import { computed } from 'vue'
import { useThemeConfig } from '../../shared/config'

/** 未配置导航栏工具时使用的默认工具顺序。 */
const DEFAULT_NAVBAR_TOOLS = ['toggleDark', 'search'] as const

/**
 * 从主题配置统一解析导航栏工具及常用工具的显示状态。
 *
 * @returns 工具列表、搜索按钮显示状态与深色模式按钮显示状态。
 */
export function useNavbarTools() {
  const themeConfig = useThemeConfig()

  // 工具项统一从配置层解析，避免桌面端和移动端各自维护一套显示条件。
  const tools = computed(() => themeConfig.value.navbarOptions?.tools ?? [...DEFAULT_NAVBAR_TOOLS])
  const showSearch = computed(() => tools.value.includes('search'))
  const showDarkToggle = computed(() => tools.value.includes('toggleDark'))
  return {
    tools,
    showSearch,
    showDarkToggle,
  }
}
