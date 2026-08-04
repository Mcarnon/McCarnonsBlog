import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { isSectionMatch, normalizePath } from './navigation-path'

/** 抽屉延迟跳转期间用于提前高亮目标导航项的模块级路径。 */
const pendingLink = ref('')

/**
 * 提供当前导航路径、激活判断及延迟跳转高亮状态管理。
 *
 * @returns 当前路径、激活路径及导航激活状态控制方法。
 */
export function useNavActive() {
  const route = useRoute()

  const currentPath = computed(() => normalizePath(route.path))
  // pendingLink 用来覆盖“抽屉先收起、再跳转”的时间窗，
  // 让移动端在动画期间也能先高亮目标导航项。
  const activePath = computed(() => normalizePath(pendingLink.value || route.path))

  /**
   * 判断链接是否与当前激活路径所属的导航分区匹配。
   *
   * @param link - 待判断的导航链接。
   * @returns 链接对应分区处于激活状态时返回 `true`。
   */
  function isActive(link: string) {
    return isSectionMatch(activePath.value, normalizePath(link))
  }

  /**
   * 设置抽屉延迟跳转期间预先高亮的目标链接。
   *
   * @param link - 即将导航到的链接。
   */
  function setPending(link: string) {
    pendingLink.value = link
  }

  /** 清除抽屉延迟跳转期间的目标链接。 */
  function clearPending() {
    pendingLink.value = ''
  }

  return {
    currentPath,
    activePath,
    isActive,
    setPending,
    clearPending,
  }
}
