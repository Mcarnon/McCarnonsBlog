import { useFrontmatter, useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveFrontmatterCover, resolveFrontmatterText } from '../../shared/frontmatter'

/** 站点作者配置中 About 页面会消费的基础资料。 */
interface SiteAuthor {
  /** 作者头像地址。 */
  avatar?: string
  /** 作者展示名称。 */
  name?: string
}

/** About 页面展示的社交链接条目。 */
export interface AboutSocialLink {
  /** 社交平台或账号名称。 */
  name: string
  /** 社交主页地址。 */
  link: string
  /** 可选的图标类名。 */
  icon?: string
  /** 可选的主题色。 */
  color?: string
}

/**
 * 将站点社交配置解析为 About 页面可展示的链接条目。
 *
 * @param item - 待解析的原始社交配置。
 * @returns 名称与链接均有效时返回规范化条目，否则返回 `null`。
 */
function normalizeSocialLink(item: unknown): AboutSocialLink | null {
  if (!item || typeof item !== 'object')
    return null

  const data = item as Record<string, unknown>
  const name = resolveFrontmatterText(data.name)
  const link = resolveFrontmatterText(data.link)

  if (!name || !link)
    return null

  return {
    name,
    link,
    icon: resolveFrontmatterText(data.icon) || undefined,
    color: resolveFrontmatterText(data.color) || undefined,
  }
}

/**
 * 汇总 About 页面的标题、封面、作者资料与社交链接。
 *
 * @remarks
 * 各字段按自身定义的来源链路回退：标题使用 Frontmatter 与国际化文案，头像使用 Frontmatter 与作者配置，
 * 描述使用 Frontmatter、站点描述与国际化文案；社交链接仅来自站点配置，并保持原始顺序、过滤无效条目。
 *
 * @returns About 页面可直接消费的响应式展示数据。
 */
export function useAboutProfile() {
  const { t } = useI18n()
  const frontmatter = useFrontmatter()
  const siteConfig = useSiteConfig()

  const pageTitle = computed(() => {
    return resolveFrontmatterText(frontmatter.value.title, t('pages.about.title'))
  })

  const pageCover = computed(() => {
    return resolveFrontmatterCover(frontmatter.value)
  })

  const author = computed<SiteAuthor>(() => siteConfig.value.author || {})
  const authorName = computed(() => {
    return resolveFrontmatterText(frontmatter.value.name, author.value.name || siteConfig.value.title || pageTitle.value)
  })
  const authorAvatar = computed(() => {
    return resolveFrontmatterText(frontmatter.value.avatar, author.value.avatar || '')
  })
  const description = computed(() => {
    return resolveFrontmatterText(
      frontmatter.value.description ?? frontmatter.value.subtitle,
      siteConfig.value.description || t('pages.about.description'),
    )
  })
  const socialLinks = computed<AboutSocialLink[]>(() => {
    const links: unknown = siteConfig.value.social

    return Array.isArray(links)
      ? links.map(normalizeSocialLink).filter((item): item is AboutSocialLink => Boolean(item))
      : []
  })

  return {
    authorAvatar,
    authorName,
    description,
    pageCover,
    pageTitle,
    profileLabel: computed(() => t('pages.about.profile')),
    socialLinks,
  }
}
