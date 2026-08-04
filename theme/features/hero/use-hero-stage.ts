import type { CSSProperties, ShallowRef } from 'vue'
import { computed } from 'vue'
import { getWindow, prefersReducedMotion } from '../../shared/browser'
import { useThemeConfig } from '../../shared/config'
import { createBackgroundImageStyle, useBackgroundPreload, useBackgroundRuntime, useResolvedBackground } from '../background'

/**
 * 组织 Hero 舞台的背景图层、布局、对齐方式和向下滚动行为。
 *
 * @param heroSection - Hero 根元素的只读浅层引用。
 * @returns Hero 模板渲染所需的响应式样式、图层状态与滚动方法。
 */
export function useHeroStage(heroSection: Readonly<ShallowRef<HTMLElement | null>>) {
  const themeConfig = useThemeConfig()
  const heroBackground = useResolvedBackground('hero')

  // 预加载必须在 SSR 阶段进入 head，才能让下载早于脚本加载与水合开始。
  useBackgroundPreload('hero')

  // Hero 在随机 API 图尚未就绪时应直接穿透全局背景。
  // 这样首屏不会先叠出一层与全局重复的静态图，背景边界也不会显脏。
  const runtimeBackground = useBackgroundRuntime('hero', heroBackground, {
    transparentUntilLoaded: true,
  })

  const heroLayoutStyle = computed<CSSProperties>(() => ({
    // Hero height 在当前主题里表示“首屏舞台高度”，
    // 语义应稳定落到 section height。
    height: themeConfig.value.hero.height || '100vh',
  }))

  const contentAlignmentClass = computed(() => {
    switch (themeConfig.value.hero.textAlign) {
      case 'left':
        return 'lm-hero-content--left items-start text-left'
      case 'right':
        return 'lm-hero-content--right items-end text-right'
      default:
        return 'lm-hero-content--center items-center text-center'
    }
  })

  const hasHeroCover = computed(() => heroBackground.value.source === 'hero')
  const hasBaseImageLayer = computed(() => Boolean(runtimeBackground.currentImageUrl.value))
  const hasIncomingImageLayer = computed(() => Boolean(runtimeBackground.incomingImageUrl.value))
  const incomingImageVisible = computed(() => runtimeBackground.incomingImageVisible.value)

  // 只有 Hero 真正持有自己的可见图层时，才应该叠加局部 overlay。
  // 否则首屏初始阶段应直接透出 app background，避免局部再盖一层半透明蒙版。
  const hasHeroVisualLayer = computed(() => hasBaseImageLayer.value || hasIncomingImageLayer.value)

  const baseImageStyle = computed<CSSProperties>(() => {
    if (!hasBaseImageLayer.value)
      return {}

    return createBackgroundImageStyle(runtimeBackground.currentImageUrl.value, {
      fixed: heroBackground.value.fixed,
      position: heroBackground.value.position,
      size: heroBackground.value.size,
    })
  })

  const incomingImageStyle = computed<CSSProperties>(() => {
    if (!hasIncomingImageLayer.value)
      return {}

    return createBackgroundImageStyle(runtimeBackground.incomingImageUrl.value, {
      fixed: heroBackground.value.fixed,
      position: heroBackground.value.position,
      size: heroBackground.value.size,
    })
  })

  const overlayStyle = computed<CSSProperties>(() => ({
    opacity: String(heroBackground.value.overlayOpacity),
    background: 'linear-gradient(180deg, var(--lm-c-overlay-base), var(--lm-c-overlay-tint))',
  }))

  /** 平滑滚动到 Hero 后的首个首页模块；不存在相邻模块时滚动一个 Hero 高度。 */
  function scrollToNextSection() {
    const currentWindow = getWindow()
    const currentSection = heroSection.value
    if (!currentWindow || !currentSection)
      return

    // Scroll-down 的目标不应写死为“一个视口高度”，
    // 而应语义化为“Hero 后的第一个首页模块”。
    // 这样后续插入 Notice / Pinned / Featured 等区块时无需重写滚动逻辑。
    const nextSection = currentSection.nextElementSibling as HTMLElement | null

    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      })
      return
    }

    currentWindow.scrollTo({
      top: currentSection.offsetTop + currentSection.offsetHeight,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  return {
    baseImageStyle,
    contentAlignmentClass,
    hasBaseImageLayer,
    hasHeroCover,
    hasHeroVisualLayer,
    hasIncomingImageLayer,
    heroLayoutStyle,
    incomingImageStyle,
    incomingImageVisible,
    overlayStyle,
    scrollToNextSection,
    showScrollDown: computed(() => Boolean(themeConfig.value.hero.showScrollDown)),
  }
}
