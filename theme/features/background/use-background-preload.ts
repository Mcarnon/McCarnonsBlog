import type { BackgroundScope } from './types'
import { useHead } from '@unhead/vue'
import { computed } from 'vue'
import { useThemeConfig } from '../../shared/config'
import { resolveBackground } from './resolve-background'

/** 预加载候选的环境组合与对应的媒体查询条件。 */
interface PreloadVariant {
  /** 该组合是否代表深色模式。 */
  isDark: boolean
  /** 该组合是否代表移动端布局。 */
  isMobile: boolean
  /** 浏览器据以决定是否发起预加载的媒体查询。 */
  media: string
}

/**
 * 与 useResolvedBackground 的运行时判定保持一致的环境组合：
 * 移动端断点为 width < 768，色彩模式跟随系统偏好。
 *
 * 手动切换过深浅模式的回访用户可能与系统偏好不一致，
 * 此时预加载会命中另一变体；这是预加载启发式的可接受误差。
 */
const PRELOAD_VARIANTS: PreloadVariant[] = [
  { isDark: false, isMobile: false, media: '(min-width: 768px) and (prefers-color-scheme: light)' },
  { isDark: true, isMobile: false, media: '(min-width: 768px) and (prefers-color-scheme: dark)' },
  { isDark: false, isMobile: true, media: '(max-width: 767.9px) and (prefers-color-scheme: light)' },
  { isDark: true, isMobile: true, media: '(max-width: 767.9px) and (prefers-color-scheme: dark)' },
]

/**
 * 在 head 中为指定作用域的首屏背景注入图片预加载。
 *
 * 背景解析是纯函数，初始目标图在 SSR 阶段即可确定；
 * 预加载让下载从 HTML 解析时就开始，而不是等到脚本加载、水合完成后
 * 才由背景运行时发起，弱网环境下可显著提前首屏背景就绪时间。
 *
 * 链接以图片地址为去重键：首页 Hero 无独立封面而穿透到全局背景时，
 * hero 与 app 两个作用域解析出同一地址，只会输出一条预加载。
 *
 * 随机图 API 场景要求接口响应可缓存（Cache-Control 非 no-store），
 * 否则运行时的同地址请求无法复用预加载结果；可通过
 * `background.preload: false` 关闭。
 *
 * @param scope - 背景生效范围；hero 作用域承载首屏视觉，使用高优先级。
 */
export function useBackgroundPreload(scope: BackgroundScope = 'app') {
  const themeConfig = useThemeConfig()

  const preloadLinks = computed(() => {
    if (themeConfig.value.background.preload === false)
      return []

    // 按 URL 聚合各环境组合：全部命中同一张图时省略 media，
    // 否则用媒体查询让浏览器只下载与当前环境匹配的那一张。
    const urlToMediaQueries = new Map<string, string[]>()

    for (const variant of PRELOAD_VARIANTS) {
      const resolved = resolveBackground({
        scope,
        background: themeConfig.value.background,
        heroCover: themeConfig.value.hero?.cover,
        isDark: variant.isDark,
        isMobile: variant.isMobile,
      })

      if (resolved.type !== 'image' || !resolved.imageUrl)
        continue

      const mediaQueries = urlToMediaQueries.get(resolved.imageUrl) ?? []
      mediaQueries.push(variant.media)
      urlToMediaQueries.set(resolved.imageUrl, mediaQueries)
    }

    return [...urlToMediaQueries.entries()].map(([url, mediaQueries]) => ({
      key: `lm-bg-preload:${url}`,
      rel: 'preload' as const,
      as: 'image' as const,
      href: url,
      // Hero 作用域是首屏主视觉，值得抢占带宽；
      // 内页的全局背景属于装饰层，保持默认优先级，避免挤占正文资源。
      ...(scope === 'hero' ? { fetchpriority: 'high' as const } : {}),
      ...(mediaQueries.length < PRELOAD_VARIANTS.length
        ? { media: mediaQueries.join(', ') }
        : {}),
    }))
  })

  useHead({ link: preloadLinks })
}
