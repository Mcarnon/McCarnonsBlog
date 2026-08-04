import type { Post } from 'valaxy'
import type { MaybeRefOrGetter } from 'vue'
import { computed, ref, toValue, watch } from 'vue'
import { useThemeConfig } from '../../shared/config'
import { normalizeExcerpt, normalizePostTitle } from './post-content'
import { appendRetryQuery, appendSeedQuery, orderBySeed } from './post-cover'

/** 单个 API 封面候选在切换到下一候选前允许的最大重试次数。 */
const API_COVER_RETRY_LIMIT = 3

/** 封面候选来源，用于区分 API 重试与普通候选切换策略。 */
type CoverCandidateSource = 'post' | 'api' | 'fallback'

/** 文章卡片可按顺序尝试的封面候选。 */
interface CoverCandidate {
  /** 候选来源，决定加载失败后的推进方式。 */
  source: CoverCandidateSource
  /** 候选封面的可请求地址。 */
  url: string
}

/**
 * 去除空地址和重复地址，保持首个候选的原始顺序。
 *
 * @param candidates - 待压缩的封面候选列表。
 * @returns 去重后的有效候选列表。
 */
function compactCoverCandidates(candidates: CoverCandidate[]) {
  const seen = new Set<string>()

  return candidates.filter((candidate) => {
    if (!candidate.url || seen.has(candidate.url))
      return false

    seen.add(candidate.url)
    return true
  })
}

/**
 * 为文章卡片构建展示数据、封面候选与错误恢复状态。
 *
 * `post` 与 `index` 均可传入普通值、Ref 或 Getter；`post` 与 `index` 的响应式变化会更新
 * 相关展示字段；封面候选集合变化时会重置候选索引与重试状态。
 *
 * @param post - 当前卡片对应的 Valaxy 文章，可为普通值、Ref 或 Getter。
 * @param index - 当前文章在列表中的位置，可为普通值、Ref 或 Getter。
 * @returns 文章展示字段、布局状态和封面失败处理函数。
 */
export function usePostCardViewModel(
  post: MaybeRefOrGetter<Post>,
  index: MaybeRefOrGetter<number> = 0,
) {
  const themeConfig = useThemeConfig()
  const postListConfig = computed(() => themeConfig.value.postList)
  const resolvedPost = computed(() => toValue(post))
  const resolvedIndex = computed(() => toValue(index))

  const seed = computed(() => resolvedPost.value.path || `${resolvedPost.value.title || 'post'}-${resolvedIndex.value}`)

  const coverCandidates = computed(() => {
    // 每组候选从稳定种子命中的位置轮转，保证同一文章顺序稳定且可尝试池内其余地址。
    const postCover = (resolvedPost.value as Post & { cover?: string }).cover
    const { coverRandom, coverApiUrls = [], coverFallback = [] } = postListConfig.value
    const apiCandidates = coverRandom
      ? orderBySeed(coverApiUrls, seed.value).map(url => ({
          source: 'api' as const,
          url: appendSeedQuery(url, seed.value),
        }))
      : []
    const fallbackCandidates = orderBySeed(coverFallback, seed.value).map(url => ({
      source: 'fallback' as const,
      url,
    }))

    return compactCoverCandidates([
      ...(postCover ? [{ source: 'post', url: postCover } as const] : []),
      ...apiCandidates,
      ...fallbackCandidates,
    ])
  })

  const coverIndex = ref(0)
  const apiRetryCount = ref(0)

  watch(coverCandidates, () => {
    coverIndex.value = 0
    apiRetryCount.value = 0
  }, { immediate: true })

  const currentCoverCandidate = computed(() => coverCandidates.value[coverIndex.value])
  const currentCover = computed(() => {
    const candidate = currentCoverCandidate.value
    if (!candidate)
      return ''

    if (candidate.source === 'api' && apiRetryCount.value > 0)
      return appendRetryQuery(candidate.url, apiRetryCount.value)

    return candidate.url
  })

  /** 将封面状态推进到下一候选，候选耗尽后回退为纯文本卡片。 */
  function advanceCoverCandidate() {
    apiRetryCount.value = 0

    if (coverIndex.value < coverCandidates.value.length - 1)
      coverIndex.value += 1
    else
      coverIndex.value = -1
  }

  /** 按候选来源处理加载失败：API 先重试，其他来源直接推进。 */
  function handleCoverError() {
    const candidate = currentCoverCandidate.value
    if (!candidate)
      return

    if (candidate.source === 'api' && apiRetryCount.value < API_COVER_RETRY_LIMIT) {
      apiRetryCount.value += 1
      return
    }

    // 所有候选耗尽后由推进函数退回纯文本卡片。
    advanceCoverCandidate()
  }

  const hasMedia = computed(() => !!currentCover.value)
  const isTextOnly = computed(() => !hasMedia.value)

  const title = computed(() => normalizePostTitle(resolvedPost.value.title))

  const displayDate = computed(() => resolvedPost.value.updated ?? resolvedPost.value.date)

  const dateLabel = computed(() => resolvedPost.value.updated ? 'Updated on' : 'Published on')

  const tags = computed(() => resolvedPost.value.tags ?? [])

  const excerpt = computed(() => {
    if (postListConfig.value.showExcerpt === false)
      return ''

    const maxExcerptLength = postListConfig.value.excerptLength ?? 140
    return normalizeExcerpt(String(resolvedPost.value.excerpt ?? ''), maxExcerptLength)
  })

  const isReversed = computed(() => {
    if (!postListConfig.value.imageReversed)
      return false

    if (!hasMedia.value)
      return false

    return resolvedIndex.value % 2 === 1
  })

  return {
    currentCover,
    dateLabel,
    displayDate,
    excerpt,
    tags,
    title,
    hasMedia,
    isTextOnly,
    isReversed,
    handleCoverError,
  }
}
