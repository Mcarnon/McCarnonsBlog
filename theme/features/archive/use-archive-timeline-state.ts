import type { ArchiveGroup } from './types'
import { useWindowSize } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

/** Archive 时间线切换为折叠模式的视口宽度，单位为像素。 */
const ARCHIVE_ACCORDION_BREAKPOINT = 1024

type ArchiveSelectionChange = 'idle' | 'expand' | 'collapse' | 'replace'

/**
 * 管理归档时间线的年份选择状态。
 *
 * 桌面和移动端共享同一个选择，初始均为折叠状态；响应式模式切换不会自动选择年份。
 *
 * @param getGroups - 获取当前归档分组的响应式函数。
 * @returns 当前模式、所选年份、所选分组及年份切换方法。
 */
export function useArchiveTimelineState(getGroups: () => ArchiveGroup[]) {
  const { width } = useWindowSize()
  const selectedYear = ref<string | null>(null)
  const selectionChange = ref<ArchiveSelectionChange>('idle')
  const groups = computed(() => getGroups())
  const isAccordionMode = computed(() => width.value < ARCHIVE_ACCORDION_BREAKPOINT)

  /**
   * 校验年份是否仍存在于当前归档分组。
   *
   * @param year - 待校验的年份。
   * @returns 年份仍可用时返回原值，否则返回 `null`。
   */
  function resolveAvailableYear(year: string | null) {
    return groups.value.some(group => group.year === year) ? year : null
  }

  /** 当前所选的归档分组；完全折叠或年份失效时为 `null`。 */
  const selectedGroup = computed(() => {
    if (!selectedYear.value)
      return null

    return groups.value.find(group => group.year === selectedYear.value) ?? null
  })

  // 保留旧版只读字段，并直接映射到当前纯点击选择状态。
  const activeYear = computed(() => selectedYear.value)
  const activeGroup = selectedGroup

  /**
   * 原子更新选择及其交互类型，确保年份替换不会经过折叠状态。
   *
   * @param nextYear - 下一次选择的年份。
   */
  function updateSelection(nextYear: string | null) {
    const previousYear = selectedYear.value

    if (previousYear === nextYear)
      return

    if (!previousYear)
      selectionChange.value = 'expand'
    else if (!nextYear)
      selectionChange.value = 'collapse'
    else
      selectionChange.value = 'replace'

    selectedYear.value = nextYear
  }

  watch(() => groups.value.map(group => group.year), () => {
    // 数据更新只清理失效选择，不自动回退到第一年。
    updateSelection(resolveAvailableYear(selectedYear.value))
  })

  /**
   * @deprecated 兼容旧版悬停预览 API；悬停展开已移除，调用不会产生任何效果。
   *
   * @param year - 旧版待预览的年份，现仅用于保持调用签名兼容。
   */
  function previewGroup(year: string) {
    void year
  }

  /**
   * @deprecated 兼容旧版桌面预览重置 API；悬停展开已移除，调用不会产生任何效果。
   */
  function resetDesktopPreview() {}

  /**
   * 切换所选年份；再次选择同一年时恢复完全折叠。
   *
   * @param year - 待切换的年份。
   */
  function selectGroup(year: string) {
    const nextYear = selectedYear.value === year ? null : resolveAvailableYear(year)
    updateSelection(nextYear)
  }

  return {
    isAccordionMode,
    activeYear,
    activeGroup,
    previewGroup,
    resetDesktopPreview,
    selectedYear,
    selectedGroup,
    selectionChange,
    selectGroup,
  }
}
