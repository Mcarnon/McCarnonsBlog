import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

/**
 * 管理移动端导航抽屉的开合状态，并在路由切换后自动收起。
 *
 * @returns 抽屉开合状态及打开、关闭、切换方法。
 */
export function useMobileDrawer() {
  const route = useRoute()
  const isOpen = ref(false)

  /** 打开移动端导航抽屉。 */
  function open() {
    isOpen.value = true
  }

  /** 关闭移动端导航抽屉。 */
  function close() {
    isOpen.value = false
  }

  /** 在打开与关闭状态之间切换移动端导航抽屉。 */
  function toggle() {
    isOpen.value = !isOpen.value
  }

  watch(() => route.fullPath, close)

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
