import type { MenuItem } from 'valaxy'
import { useOutline } from 'valaxy'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { createThrottledFunction, getDocument, getDocumentElement, getWindow } from '../../shared/browser'
import { clamp } from '../../shared/utils'
import { lockNavbarScrollReaction } from '../navigation'

/** 目录链接中用于定位页面标题元素的哈希前缀。 */
const HASH_PREFIX_RE = /^#/
/** 激活判定线与导航栏底部之间保留的最小像素间距。 */
const ACTIVE_SCROLL_GAP = 24
/** 激活判定线距离视口顶部的最小像素值。 */
const ACTIVE_LINE_MIN = 96
/** 激活判定线距离视口顶部的最大像素值。 */
const ACTIVE_LINE_MAX = 168
/** 滚动期间重新计算激活目录项的节流时长，单位为毫秒。 */
const ACTIVE_SCROLL_THROTTLE = 100

/** 供文章目录组件展示与定位的扁平目录项。 */
interface TocItem {
  /** 标题展示文本。 */
  title: string
  /** 指向文章标题元素的哈希链接。 */
  link: string
  /** 相对于目录根节点的嵌套深度。 */
  depth: number
}

/**
 * 计算目录激活判定线相对于视口顶部的偏移量。
 *
 * @returns 结合导航栏高度与阅读区域比例得到的像素偏移；浏览器环境不可用时返回固定兜底值。
 */
function getActiveScrollOffset() {
  const currentWindow = getWindow()
  const root = getDocumentElement()
  if (!currentWindow || !root)
    return 160

  const rawOffset = currentWindow.getComputedStyle(root)
    .getPropertyValue('--lm-navbar-offset')
    .trim()
  const parsedOffset = Number.parseFloat(rawOffset)
  const navbarOffset = Number.isFinite(parsedOffset) ? parsedOffset : 72
  // 激活线放在视口上方阅读区域内，比单纯贴着导航栏更符合阅读进度感知。
  const readingLineOffset = clamp(currentWindow.innerHeight * 0.18, ACTIVE_LINE_MIN, ACTIVE_LINE_MAX)

  return Math.max(navbarOffset + ACTIVE_SCROLL_GAP, readingLineOffset)
}

/**
 * 将 Valaxy 的树形大纲按原顺序展开为目录项列表。
 *
 * @param nodes - 当前层级的 Valaxy 大纲节点。
 * @param depth - 当前节点相对于目录根节点的嵌套深度。
 * @returns 保留标题、链接和深度信息的扁平目录项。
 */
function flattenTocItems(nodes: MenuItem[], depth = 0): TocItem[] {
  return nodes.flatMap((node) => {
    const currentItem = node.link && node.title
      ? [{ title: node.title, link: node.link, depth }]
      : []
    const childItems = Array.isArray(node.children) && node.children.length
      ? flattenTocItems(node.children, depth + 1)
      : []

    return [...currentItem, ...childItems]
  })
}

/**
 * 按标题的文档位置解析当前应激活的目录链接。
 *
 * @param items - 按文章顺序排列的目录项。
 * @param scrollTop - 已包含激活判定偏移的页面滚动位置。
 * @param currentDocument - 用于查询标题元素的当前文档。
 * @param currentWindow - 用于换算标题绝对位置的当前窗口。
 * @returns 判定线之前最后一个标题的链接；尚未经过标题时返回首项链接。
 */
function resolveActiveLink(items: TocItem[], scrollTop: number, currentDocument: Document, currentWindow: Window) {
  return items.reduce((activeLink, item) => {
    const id = decodeURIComponent(item.link.replace(HASH_PREFIX_RE, ''))
    const heading = currentDocument.getElementById(id)

    if (!heading)
      return activeLink

    const headingTop = heading.getBoundingClientRect().top + currentWindow.scrollY
    return headingTop <= scrollTop ? item.link : activeLink
  }, items[0]?.link || '')
}

/**
 * 管理文章目录的条目、可见性、激活链接与点击滚动行为。
 *
 * @remarks
 * 目录仅展示前两级标题；滚动时按固定时长节流更新激活项，点击目录时短暂锁定
 * 导航栏滚动响应，并在组件卸载时移除事件监听与取消待执行的节流任务。
 *
 * @returns 供桌面与移动目录组件共享的响应式状态和点击处理函数。
 */
export function useArticleTocState() {
  const { headers, handleClick: originalHandleClick } = useOutline()
  const activeLink = ref('')

  const items = computed<TocItem[]>(() => {
    // 组件只展示两级目录，深层标题仍参与 Valaxy 大纲但不挤压侧栏层级。
    return flattenTocItems(headers.value || []).filter(item => item.depth <= 1)
  })
  const visible = computed(() => items.value.length >= 2)

  /**
   * 处理目录项点击，并在 Valaxy 执行页面滚动期间抑制导航栏闪烁。
   *
   * @param event - 目录链接的鼠标点击事件。
   */
  function handleClick(event: MouseEvent) {
    // 点击目录会主动滚动页面，短暂锁住导航栏滚动响应可避免头部闪烁。
    lockNavbarScrollReaction({
      deferFrames: 2,
      timeoutMs: 420,
    })
    originalHandleClick(event)
  }

  /** 根据当前滚动位置同步激活目录链接，并处理空目录与非浏览器环境。 */
  function updateActiveLink() {
    const currentItems = items.value
    if (!currentItems.length) {
      activeLink.value = ''
      return
    }

    const currentWindow = getWindow()
    const currentDocument = getDocument()
    if (!currentWindow || !currentDocument) {
      activeLink.value = currentItems[0]?.link || ''
      return
    }

    const scrollTop = currentWindow.scrollY + getActiveScrollOffset()
    activeLink.value = resolveActiveLink(currentItems, scrollTop, currentDocument, currentWindow)
  }

  const updateActiveLinkOnScroll = createThrottledFunction(updateActiveLink, ACTIVE_SCROLL_THROTTLE)

  /** 移除目录滚动与尺寸监听，并取消尚未执行的节流更新。 */
  function cleanupTocListeners() {
    const currentWindow = getWindow()
    currentWindow?.removeEventListener('scroll', updateActiveLinkOnScroll)
    currentWindow?.removeEventListener('resize', updateActiveLink)
    updateActiveLinkOnScroll.cancel()
  }

  onMounted(() => {
    const currentWindow = getWindow()

    nextTick(() => {
      updateActiveLink()
    })

    currentWindow?.addEventListener('scroll', updateActiveLinkOnScroll, { passive: true })
    currentWindow?.addEventListener('resize', updateActiveLink, { passive: true })
  })

  onUnmounted(cleanupTocListeners)

  watch(
    items,
    async () => {
      await nextTick()
      updateActiveLink()
    },
    { deep: true },
  )

  return {
    items,
    visible,
    activeLink,
    handleClick,
  }
}
