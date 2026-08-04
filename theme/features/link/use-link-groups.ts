import type { LinkGroup, LinkItem } from '../../types'
import { computed } from 'vue'
import { useThemeConfig } from '../../shared/config'

/** 经过校验并补齐展示字段的友链条目。 */
export interface ResolvedLinkItem extends LinkItem {
  /** 去除首尾空白后的站点名称。 */
  name: string
  /** 去除首尾空白后的站点描述。 */
  desc: string
  /** 去除首尾空白后的目标地址。 */
  url: string
  /** 去除首尾空白后的头像地址。 */
  avatar: string
  /** 卡片强调色，未配置时使用主题品牌色。 */
  color: string
  /** 去除首尾空白后的博客副标题。 */
  blog: string
  /** 头像缺失时展示的名称前两个字符。 */
  initials: string
}

/** 经过校验且至少包含一个有效条目的友链分组。 */
export interface ResolvedLinkGroup {
  /** 分组标题。 */
  title: string
  /** 保持配置顺序的有效友链条目。 */
  items: ResolvedLinkItem[]
}

/** 友链未配置强调色时采用的主题品牌色。 */
const DEFAULT_ACCENT_COLOR = 'var(--lm-c-brand)'

/**
 * 提取友链名称的前两个 Unicode 字符作为头像占位文本。
 *
 * @param name - 已解析的友链名称。
 * @returns 最多两个字符的缩写；名称为空时返回问号。
 */
function resolveInitials(name: string) {
  const normalized = name.trim()
  if (!normalized)
    return '?'

  return Array.from(normalized).slice(0, 2).join('')
}

/**
 * 校验并补齐单个友链条目的展示字段。
 *
 * @param item - 原始友链配置。
 * @returns 名称与地址均有效时返回规范化条目，否则返回 `null`。
 */
function normalizeLinkItem(item: LinkItem): ResolvedLinkItem | null {
  const name = item.name?.trim()
  const url = item.url?.trim()

  if (!name || !url)
    return null

  return {
    ...item,
    name,
    url,
    desc: item.desc?.trim() ?? '',
    avatar: item.avatar?.trim() ?? '',
    color: item.color?.trim() || DEFAULT_ACCENT_COLOR,
    blog: item.blog?.trim() ?? '',
    initials: resolveInitials(name),
  }
}

/**
 * 过滤无有效条目的友链分组，并规范化分组标题。
 *
 * @param group - 原始友链分组配置。
 * @returns 至少含一个有效条目时返回规范化分组，否则返回 `null`。
 */
function normalizeLinkGroup(group: LinkGroup): ResolvedLinkGroup | null {
  const items = (group.items ?? [])
    .map(normalizeLinkItem)
    .filter((item): item is ResolvedLinkItem => Boolean(item))

  if (!items.length)
    return null

  return {
    title: group.title?.trim() || 'Links',
    items,
  }
}

/**
 * 从主题配置生成友链分组、数量统计与状态检测开关。
 *
 * @returns 保持原配置顺序的友链分组及其响应式统计信息。
 */
export function useLinkGroups() {
  const themeConfig = useThemeConfig()

  const groups = computed<ResolvedLinkGroup[]>(() => {
    return (themeConfig.value.links?.groups ?? [])
      .map(normalizeLinkGroup)
      .filter((group): group is ResolvedLinkGroup => Boolean(group))
  })

  const totalGroups = computed(() => groups.value.length)
  const totalLinks = computed(() => {
    return groups.value.reduce((total, group) => total + group.items.length, 0)
  })
  const statusCheck = computed(() => themeConfig.value.links?.statusCheck === true)

  return {
    groups,
    statusCheck,
    totalGroups,
    totalLinks,
  }
}
