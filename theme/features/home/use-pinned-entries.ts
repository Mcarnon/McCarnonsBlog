import { computed } from 'vue'
import { useThemeConfig } from '../../shared/config'

/**
 * 构建首页置顶区域的有效条目、布局类名与显示状态。
 *
 * @returns 置顶区域标题、有效条目、布局状态和回退标签生成函数。
 */
export function usePinnedEntries() {
  const themeConfig = useThemeConfig()

  const sectionTitle = computed(() => themeConfig.value.pinned.title?.trim() ?? 'Start')
  const entries = computed(() => {
    return (themeConfig.value.pinned.entries ?? []).filter((entry) => {
      return Boolean(entry.title?.trim()) && Boolean(entry.link?.trim())
    })
  })

  const entryCount = computed(() => entries.value.length)
  const trackClass = computed(() => {
    if (entryCount.value === 1)
      return 'lm-pinned__track--single'
    if (entryCount.value === 2)
      return 'lm-pinned__track--double'
    if (entryCount.value === 3)
      return 'lm-pinned__track--triple'

    return 'lm-pinned__track--scroll'
  })

  const visible = computed(() => {
    return themeConfig.value.pinned.enable && entryCount.value > 0
  })

  /**
   * 从置顶条目标题生成无图片时展示的两字符标签。
   *
   * @param title - 置顶条目的原始标题。
   * @returns 去除首尾空白后前两个字符的大写形式。
   */
  function getFallbackLabel(title: string) {
    return title.trim().slice(0, 2).toUpperCase()
  }

  return {
    sectionTitle,
    entries,
    entryCount,
    trackClass,
    visible,
    getFallbackLabel,
  }
}
