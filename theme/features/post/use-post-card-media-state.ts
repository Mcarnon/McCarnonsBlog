import type { Ref } from 'vue'
import type { BrowserTimeout } from '../../shared/browser'
import { useIntersectionObserver } from '@vueuse/core'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { clearBrowserTimeout, setBrowserTimeout } from '../../shared/browser'

/** 文章卡片封面加载的最长等待时间，超时后进入候选切换流程。 */
export const POST_CARD_COVER_LOAD_TIMEOUT_MS = 60_000

/** 文章卡片媒体加载状态所需的响应式输入与失败处理选项。 */
export interface UsePostCardMediaStateOptions {
  /** 当前文章卡片是否存在可展示的媒体资源。 */
  hasMedia: Readonly<Ref<boolean>>
  /** 当前封面地址，用于识别过期的加载或错误事件。 */
  cover: Readonly<Ref<string>>
  /** 图片元素引用，用于补处理缓存命中和监听注册前已完成的请求。 */
  imageElement?: Readonly<Ref<HTMLImageElement | null>>
  /** 当前封面加载失败或超时时触发的候选推进回调。 */
  onCoverFailure?: () => void
}

/**
 * 管理文章卡片封面的加载、超时与失败状态。
 *
 * @param options - 媒体状态依赖与失败回调。
 * @returns 图片可见状态、占位状态以及图片事件处理函数。
 */
export function usePostCardMediaState(options: UsePostCardMediaStateOptions) {
  const { hasMedia, cover, imageElement, onCoverFailure } = options
  const imageLoaded = ref(false)
  let loadTimeout: BrowserTimeout | undefined
  let mounted = false

  // 封面使用原生懒加载后，远离视口的图片不会发起网络请求。
  // 超时保护如果从挂载就开始计时，会把“尚未开始加载”误判为“加载失败”，
  // 因此以视口交叉作为计时闸门；未提供元素引用时退回“挂载即计时”的旧行为。
  const nearViewport = ref(!imageElement)

  if (imageElement) {
    // useIntersectionObserver 在 SSR 环境下自动降级为空操作，无需额外守卫。
    const { stop: stopViewportObserver } = useIntersectionObserver(
      imageElement,
      (entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          nearViewport.value = true
          stopViewportObserver()
        }
      },
      { rootMargin: '200px 0px' },
    )
  }

  /** 清除当前封面加载超时任务，避免旧请求影响新候选。 */
  function clearLoadTimeout() {
    clearBrowserTimeout(loadTimeout)
    loadTimeout = undefined
  }

  /**
   * 在地址仍为当前候选时标记加载失败并通知视图模型。
   *
   * @param expectedCover - 发起检测时记录的封面地址。
   */
  function failCurrentCover(expectedCover: string) {
    if (!expectedCover || expectedCover !== cover.value || !hasMedia.value)
      return

    clearLoadTimeout()
    imageLoaded.value = false
    onCoverFailure?.()
  }

  /**
   * 为当前封面启动加载超时保护。
   *
   * @param expectedCover - 启动定时器时的封面地址。
   */
  function startLoadTimeout(expectedCover: string) {
    clearLoadTimeout()
    loadTimeout = setBrowserTimeout(() => {
      loadTimeout = undefined
      failCurrentCover(expectedCover)
    }, POST_CARD_COVER_LOAD_TIMEOUT_MS)
  }

  /** 同步图片元素状态，覆盖缓存命中和事件监听注册前已完成的请求。 */
  async function syncLoadedStateFromElement() {
    await nextTick()

    if (!mounted)
      return

    const expectedCover = cover.value
    const image = imageElement?.value
    if (!expectedCover || !hasMedia.value || !image)
      return

    // SSR 首屏或浏览器缓存可能让图片在 Vue 绑定监听前就结束请求。
    if (image.complete) {
      if (image.naturalWidth > 0)
        handleImageLoad()
      else
        failCurrentCover(expectedCover)
      return
    }

    // 懒加载图片在靠近视口前不开始计时，避免对未发起的请求误判超时。
    if (nearViewport.value)
      startLoadTimeout(expectedCover)
  }

  watch(nearViewport, (value) => {
    if (value && mounted)
      void syncLoadedStateFromElement()
  })

  watch(
    [() => cover.value, () => hasMedia.value],
    () => {
      clearLoadTimeout()
      imageLoaded.value = false

      if (mounted)
        void syncLoadedStateFromElement()
    },
    { immediate: true },
  )

  onMounted(() => {
    mounted = true
    void syncLoadedStateFromElement()
  })

  onBeforeUnmount(() => {
    mounted = false
    clearLoadTimeout()
  })

  const showLoadingPlaceholder = computed(() => hasMedia.value && !imageLoaded.value)

  /**
   * 判断图片事件是否属于当前封面，忽略候选切换后的迟到事件。
   *
   * @param event - 图片加载或错误事件。
   * @returns 事件未携带地址或地址匹配当前封面时返回 `true`。
   */
  function isCurrentCoverEvent(event?: Event) {
    const image = event?.currentTarget as HTMLImageElement | null
    const eventCover = image?.getAttribute('src')
    return !eventCover || eventCover === cover.value
  }

  /**
   * 处理当前封面加载成功事件并结束超时监控。
   *
   * @param event - 可选的图片加载事件。
   */
  function handleImageLoad(event?: Event) {
    if (!isCurrentCoverEvent(event))
      return

    clearLoadTimeout()
    imageLoaded.value = true
  }

  /**
   * 处理当前封面加载失败事件并触发候选推进。
   *
   * @param event - 可选的图片错误事件。
   */
  function handleImageError(event?: Event) {
    if (!isCurrentCoverEvent(event))
      return

    failCurrentCover(cover.value)
  }

  return {
    imageLoaded,
    showLoadingPlaceholder,
    handleImageError,
    handleImageLoad,
  }
}
