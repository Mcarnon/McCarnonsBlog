import type { BrowserTimeout } from '../../shared/browser'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { clearBrowserTimeout, getWindow, isAbortError, setBrowserTimeout } from '../../shared/browser'
import { useThemeConfig } from '../../shared/config'
import { fetchHitokoto } from './hitokoto'
import { useTypewriter } from './typewriter'

/** Hero 打字机允许的最小字符间隔，单位为毫秒。 */
const MIN_TYPING_SPEED = 24
/** Hero 签名轮换或一言刷新允许的最小间隔，单位为毫秒。 */
const MIN_ROTATION_DELAY = 1200
/** 一言正文与来源之间未配置分隔符时使用的默认值。 */
const DEFAULT_HITOKOTO_SEPARATOR = '——'

/**
 * 管理 Hero 签名的配置读取、一言请求、轮换和打字机渲染状态。
 *
 * SSR/SSG 阶段先使用配置签名，一言仅在组件挂载后请求；首次请求未取得正文时回退到配置签名。
 *
 * @returns Hero 签名展示所需的响应式状态。
 */
export function useHeroMotto() {
  const themeConfig = useThemeConfig()
  const activeIndex = ref(0)
  const mottoRenderKey = ref(0)
  const hitokotoMotto = ref('')
  const isHitokotoPending = ref(false)
  const isMounted = ref(false)
  const { render: renderTypewriter, renderedText: renderedMotto, stop: stopTypewriter } = useTypewriter()
  let rotationTimer: BrowserTimeout | undefined
  let hitokotoRequestController: AbortController | undefined
  let hitokotoRequestGeneration = 0
  let scheduleGeneration = 0
  let isUnmounted = false

  const useHitokoto = computed(() => themeConfig.value.hero.mottoSource === 'hitokoto')

  /** 标识会影响一言请求参数或返回文本格式的当前配置快照。 */
  const hitokotoConfigSnapshotKey = computed(() => {
    const options = themeConfig.value.hero.hitokoto
    return JSON.stringify([
      options.sentenceTypes ?? [],
      options.minLength,
      options.maxLength,
      options.showFrom,
      options.fromSeparator,
    ])
  })

  const configMottoList = computed(() => {
    const { motto } = themeConfig.value.hero

    if (Array.isArray(motto))
      return motto.filter(Boolean)

    return motto ? [motto] : []
  })

  const mottoList = computed(() => {
    if (!useHitokoto.value)
      return configMottoList.value

    if (isHitokotoPending.value)
      return []

    return hitokotoMotto.value ? [hitokotoMotto.value] : configMottoList.value
  })

  const hasMotto = computed(() => mottoList.value.length > 0)
  // hitokoto 模式下文案虽然要等客户端请求，但“会有一条 motto”在配置阶段就已确定，
  // 因此 SSR 就渲染条带外壳预留占位，避免水合后插入条带抬动整个 Hero 内容。
  // 代价：接口失败且无配置兜底时会留下一条空壳，相比布局偏移这是可接受的取舍。
  const shouldShowMotto = computed(() => hasMotto.value || useHitokoto.value)
  const shouldRotate = computed(() => mottoList.value.length > 1)
  const accessibleMotto = computed(() => mottoList.value[activeIndex.value] ?? '')
  const shouldType = computed(() => Boolean(themeConfig.value.hero.typewriter))
  const shouldFadeMotto = computed(() => !shouldType.value)
  const typingSpeed = computed(() => Math.max(themeConfig.value.hero.typingSpeed || 100, MIN_TYPING_SPEED))
  const rotationDelay = computed(() => Math.max(themeConfig.value.hero.mottoInterval || 4000, MIN_ROTATION_DELAY))

  /** 停止签名轮换和逐字渲染使用的全部计时器，并使既有排程回调失效。 */
  function clearTimers() {
    scheduleGeneration += 1
    stopTypewriter()
    clearBrowserTimeout(rotationTimer)

    rotationTimer = undefined
  }

  /** 取消当前一言请求，并使其后续异步结果失去提交资格。 */
  function invalidateHitokotoRequest() {
    hitokotoRequestGeneration += 1
    hitokotoRequestController?.abort()
    hitokotoRequestController = undefined
  }

  /**
   * 在浏览器中请求并更新一言签名。
   *
   * 请求参数与来源格式在发起请求前使用同一份配置快照，只有最新请求可以提交结果。
   *
   * @returns 成功取得非空正文时返回 `true`，不可请求、过期或请求失败时返回 `false`。
   */
  async function refreshHitokoto() {
    if (!getWindow() || !isMounted.value || isUnmounted || !useHitokoto.value)
      return false

    hitokotoRequestController?.abort()

    const requestController = new AbortController()
    const requestGeneration = ++hitokotoRequestGeneration
    const hitokotoOptions = themeConfig.value.hero.hitokoto
    const requestOptions = {
      sentenceTypes: hitokotoOptions.sentenceTypes ? [...hitokotoOptions.sentenceTypes] : undefined,
      minLength: hitokotoOptions.minLength,
      maxLength: hitokotoOptions.maxLength,
    }
    const showFrom = hitokotoOptions.showFrom
    const fromSeparator = hitokotoOptions.fromSeparator || DEFAULT_HITOKOTO_SEPARATOR
    hitokotoRequestController = requestController
    isHitokotoPending.value = true

    /** 判断当前异步流程是否仍拥有一言状态提交资格。 */
    const isCurrentRequest = () => requestGeneration === hitokotoRequestGeneration
      && requestController === hitokotoRequestController
      && isMounted.value
      && !isUnmounted
      && useHitokoto.value

    try {
      const data = await fetchHitokoto(requestOptions, requestController.signal)
      if (!isCurrentRequest())
        return false

      const text = data.hitokoto?.trim()
      if (!text)
        return false

      const from = (data.from || data.fromWho || '').trim()
      hitokotoMotto.value = showFrom && from
        ? `${text} ${fromSeparator} ${from}`
        : text

      return true
    }
    catch (error) {
      if (isCurrentRequest() && !isAbortError(error, requestController.signal))
        console.error('[lolimeow] Failed to fetch hitokoto.', error)

      return false
    }
    finally {
      if (isCurrentRequest()) {
        isHitokotoPending.value = false
        hitokotoRequestController = undefined
      }
    }
  }

  /**
   * 根据当前签名来源和列表状态安排下一次轮换或一言刷新。
   *
   * @param expectedGeneration - 发起排程的渲染代际；过期回调不得覆盖当前计时器。
   */
  function scheduleNextMotto(expectedGeneration: number) {
    if (
      expectedGeneration !== scheduleGeneration
      || !isMounted.value
      || isUnmounted
      || !getWindow()
    ) {
      return
    }

    clearBrowserTimeout(rotationTimer)
    rotationTimer = undefined

    const timerGeneration = scheduleGeneration
    if (useHitokoto.value) {
      rotationTimer = setBrowserTimeout(async () => {
        if (
          timerGeneration !== scheduleGeneration
          || !isMounted.value
          || isUnmounted
          || !useHitokoto.value
        ) {
          return
        }

        rotationTimer = undefined
        const currentMottoKey = mottoList.value.join('\u0000')
        const fetched = await refreshHitokoto()

        if (
          timerGeneration !== scheduleGeneration
          || !isMounted.value
          || isUnmounted
          || !useHitokoto.value
        ) {
          return
        }

        if (!fetched || mottoList.value.join('\u0000') === currentMottoKey)
          scheduleNextMotto(timerGeneration)
      }, rotationDelay.value)
      return
    }

    if (!shouldRotate.value)
      return

    // 轮播定时器和打字定时器必须严格分离：
    // 前者控制“下一条何时开始”，后者控制“当前条如何显现”。
    rotationTimer = setBrowserTimeout(() => {
      if (
        timerGeneration !== scheduleGeneration
        || !isMounted.value
        || isUnmounted
        || useHitokoto.value
        || !shouldRotate.value
      ) {
        return
      }

      rotationTimer = undefined
      activeIndex.value = (activeIndex.value + 1) % mottoList.value.length
      renderActiveMotto()
    }, rotationDelay.value)
  }

  /**
   * 立即显示完整签名，并在完成后安排下一次轮换。
   *
   * @param text - 待显示的完整签名。
   */
  function renderImmediately(text: string) {
    const renderGeneration = scheduleGeneration
    mottoRenderKey.value += 1
    renderTypewriter({
      immediate: true,
      onComplete: () => scheduleNextMotto(renderGeneration),
      speed: typingSpeed.value,
      text,
    })
  }

  /**
   * 组件挂载后逐字显示签名；挂载前退化为立即渲染以保持 SSR 文本一致。
   *
   * @param text - 待显示的完整签名。
   */
  function renderWithTypewriter(text: string) {
    if (!isMounted.value) {
      renderImmediately(text)
      return
    }

    const renderGeneration = scheduleGeneration
    mottoRenderKey.value += 1
    renderTypewriter({
      onComplete: () => scheduleNextMotto(renderGeneration),
      speed: typingSpeed.value,
      text,
    })
  }

  /** 根据当前索引和打字机配置重新渲染活动签名。 */
  function renderActiveMotto() {
    clearTimers()

    const currentMotto = mottoList.value[activeIndex.value] ?? ''
    if (!currentMotto) {
      renderedMotto.value = ''
      return
    }

    if (!shouldType.value) {
      renderImmediately(currentMotto)
      return
    }

    renderWithTypewriter(currentMotto)
  }

  watch(
    () => [
      mottoList.value.join('\u0000'),
      useHitokoto.value,
      shouldType.value,
      typingSpeed.value,
      rotationDelay.value,
    ],
    () => {
      // Hero 配置变化后必须从第一条重新启动状态机，否则会出现：
      // 旧定时器继续驱动新配置、activeIndex 越界、旧文案残留等时序污染。
      activeIndex.value = 0
      renderActiveMotto()
    },
    { immediate: true },
  )

  watch(
    () => [useHitokoto.value, hitokotoConfigSnapshotKey.value] as const,
    ([enabled], previousSnapshot) => {
      const wasEnabled = previousSnapshot?.[0] ?? false
      invalidateHitokotoRequest()

      if (!enabled) {
        if (wasEnabled)
          clearTimers()

        isHitokotoPending.value = false
        hitokotoMotto.value = ''
        return
      }

      clearTimers()

      // 一言请求属于纯客户端动态增强，不能在 hydration 前改变首屏文案，
      // 否则 SSG fallback motto 会和客户端 pending/空文案发生文本不一致。
      if (!isMounted.value)
        return

      renderedMotto.value = ''
      void refreshHitokoto()
    },
    { flush: 'sync', immediate: true },
  )

  onMounted(() => {
    isMounted.value = true
    renderActiveMotto()

    if (useHitokoto.value)
      void refreshHitokoto()
  })

  onBeforeUnmount(() => {
    isUnmounted = true
    isMounted.value = false
    invalidateHitokotoRequest()
    isHitokotoPending.value = false
    clearTimers()
  })

  return {
    accessibleMotto,
    hasMotto,
    mottoRenderKey,
    renderedMotto,
    shouldFadeMotto,
    shouldShowMotto,
  }
}
