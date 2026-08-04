import type { ProjectGroup, ProjectItem, ProjectStatus } from '../../types'
import { computed } from 'vue'
import { useThemeConfig } from '../../shared/config'

/** 项目卡片可执行的外部跳转动作。 */
export interface ProjectAction {
  /** 动作类型，决定按钮文案与图标。 */
  type: 'visit' | 'repo' | 'docs' | 'demo'
  /** 动作对应的外部地址。 */
  url: string
}

/** 经过校验并补齐展示字段的项目条目。 */
export interface ResolvedProjectItem extends ProjectItem {
  /** 去除首尾空白后的项目名称。 */
  name: string
  /** 去除首尾空白后的项目描述。 */
  desc: string
  /** 项目卡片强调色。 */
  color: string
  /** 去重并去除空白项后的标签列表。 */
  tags: string[]
  /** 规范化后的项目状态。 */
  status: ProjectStatus
  /** 是否将项目标记为精选。 */
  featured: boolean
  /** 按访问、仓库、文档、演示顺序排列的有效动作。 */
  actions: ProjectAction[]
}

/** 经过校验且至少包含一个有效项目的分组。 */
export interface ResolvedProjectGroup {
  /** 分组标题。 */
  title: string
  /** 去除首尾空白后的分组描述。 */
  desc: string
  /** 保持配置顺序的有效项目。 */
  items: ResolvedProjectItem[]
}

/** 项目未配置强调色时采用的主题品牌色。 */
const DEFAULT_ACCENT_COLOR = 'var(--lm-c-brand)'

/** 项目未配置或配置未知状态时采用的默认活跃状态。 */
const DEFAULT_STATUS: ProjectStatus = 'active'

/**
 * 将可选项目地址规范化为卡片动作。
 *
 * @param type - 动作类型。
 * @param url - 待规范化的外部地址。
 * @returns 地址有效时返回项目动作，否则返回 `null`。
 */
function normalizeProjectAction(type: ProjectAction['type'], url: string | undefined): ProjectAction | null {
  const normalizedUrl = url?.trim()
  if (!normalizedUrl)
    return null

  return {
    type,
    url: normalizedUrl,
  }
}

/**
 * 清理并去重项目标签，同时保持首次出现顺序。
 *
 * @param tags - 原始项目标签列表。
 * @returns 去除空白项与重复项后的标签列表。
 */
function normalizeProjectTags(tags: string[] | undefined) {
  if (!Array.isArray(tags))
    return []

  return Array.from(new Set(tags.map(tag => tag.trim()).filter(Boolean)))
}

/**
 * 将项目状态限制为主题支持的状态集合。
 *
 * @param status - 原始项目状态。
 * @returns `archived`、`wip` 或默认的 `active` 状态。
 */
function normalizeProjectStatus(status: ProjectStatus | undefined): ProjectStatus {
  if (status === 'archived' || status === 'wip')
    return status

  return DEFAULT_STATUS
}

/**
 * 校验项目名称并补齐卡片展示字段与动作。
 *
 * @param item - 原始项目配置。
 * @returns 名称有效时返回规范化项目，否则返回 `null`。
 */
function normalizeProjectItem(item: ProjectItem): ResolvedProjectItem | null {
  const name = item.name?.trim()
  if (!name)
    return null

  const actions = [
    normalizeProjectAction('visit', item.link),
    normalizeProjectAction('repo', item.repo),
    normalizeProjectAction('docs', item.docs),
    normalizeProjectAction('demo', item.demo),
  ].filter((action): action is ProjectAction => Boolean(action))

  return {
    ...item,
    name,
    desc: item.desc?.trim() ?? '',
    link: item.link?.trim() || undefined,
    repo: item.repo?.trim() || undefined,
    docs: item.docs?.trim() || undefined,
    demo: item.demo?.trim() || undefined,
    cover: item.cover?.trim() || undefined,
    icon: item.icon?.trim() || undefined,
    iconImg: item.iconImg?.trim() || undefined,
    color: item.color?.trim() || DEFAULT_ACCENT_COLOR,
    tags: normalizeProjectTags(item.tags),
    status: normalizeProjectStatus(item.status),
    featured: item.featured === true,
    actions,
  }
}

/**
 * 过滤无有效项目的分组，并规范化分组展示信息。
 *
 * @param group - 原始项目分组配置。
 * @returns 至少包含一个有效项目时返回规范化分组，否则返回 `null`。
 */
function normalizeProjectGroup(group: ProjectGroup): ResolvedProjectGroup | null {
  const items = (group.items ?? [])
    .map(normalizeProjectItem)
    .filter((item): item is ResolvedProjectItem => Boolean(item))

  if (!items.length)
    return null

  return {
    title: group.title?.trim() || 'Projects',
    desc: group.desc?.trim() ?? '',
    items,
  }
}

/**
 * 从主题配置生成项目分组及项目、分组和精选数量统计。
 *
 * @returns 保持配置顺序的项目分组与响应式统计信息。
 */
export function useProjectGroups() {
  const themeConfig = useThemeConfig()

  const groups = computed<ResolvedProjectGroup[]>(() => {
    return (themeConfig.value.projects?.groups ?? [])
      .map(normalizeProjectGroup)
      .filter((group): group is ResolvedProjectGroup => Boolean(group))
  })

  const totalGroups = computed(() => groups.value.length)
  const totalProjects = computed(() => {
    return groups.value.reduce((total, group) => total + group.items.length, 0)
  })
  const totalFeatured = computed(() => {
    return groups.value.reduce((total, group) => total + group.items.filter(item => item.featured).length, 0)
  })

  return {
    groups,
    totalFeatured,
    totalGroups,
    totalProjects,
  }
}
