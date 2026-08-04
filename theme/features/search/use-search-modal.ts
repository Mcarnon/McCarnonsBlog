import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

/**
 * 管理搜索弹窗的打开、关闭与切换状态。
 *
 * @returns 搜索弹窗状态与对应控制方法。
 */
export function useSearchModal() {
  const route = useRoute()
  const isOpen = ref(false)

  /** 打开搜索弹窗。 */
  function open() {
    isOpen.value = true
  }

  /** 关闭搜索弹窗。 */
  function close() {
    isOpen.value = false
  }

  /** 在打开与关闭状态之间切换搜索弹窗。 */
  function toggle() {
    isOpen.value = !isOpen.value
  }

  // 结果点击、程序导航与浏览器前进/后退都会更新 fullPath，统一在状态源关闭弹窗。
  watch(() => route.fullPath, close)

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
