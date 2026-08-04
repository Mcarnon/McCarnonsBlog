/* eslint-disable perfectionist/sort-exports */

export type { AboutSocialLink } from '../features/about'
export { useAboutProfile } from '../features/about'

export { useArticleHeaderMeta, useArticleTocState } from '../features/article'

export type { ArchiveEntry, ArchiveGroup } from '../features/archive'
export {
  buildArchiveGroups,
  normalizeArchiveCategories,
  resolveArchiveYear,
  useArchiveGroups,
  useArchiveTimelineState,
} from '../features/archive'

export { useBackgroundRuntime, useResolvedBackground } from '../features/background'

export type { CategoryEntry, CategoryNode } from '../features/category'
export {
  buildCategoryTree,
  countCategoryNodes,
  normalizeCategorySegments,
  useCategoryGroups,
} from '../features/category'

export type { TypewriterRenderOptions } from '../features/hero'
export { useHeroMotto, useHeroStage, useTypewriter } from '../features/hero'

export {
  useHomePaginationScrollBehavior,
  useHomePostFeed,
  usePaginationItems,
  usePinnedEntries,
} from '../features/home'

export type { LinkStatus, ResolvedLinkGroup, ResolvedLinkItem } from '../features/link'
export { useLinkGroups, useLinkStatus } from '../features/link'

export {
  isExternalNavLink,
  resolveInternalNavRoute,
  shouldOpenNavLinkWithWindow,
  shouldShowExternalNavIndicator,
  useLayoutShell,
  useMobileDrawer,
  useNavActive,
  useNavbarTools,
  useNavbarVisibility,
  useNavItemState,
} from '../features/navigation'

export {
  POST_CARD_COVER_LOAD_TIMEOUT_MS,
  usePostCardMediaState,
  usePostCardViewModel,
} from '../features/post'

export type {
  ProjectAction,
  ResolvedProjectGroup,
  ResolvedProjectItem,
} from '../features/project'
export { useProjectGroups } from '../features/project'

export type {
  LmFuseSearchItem,
  LmFuseSearchResult,
  LmSearchHighlightPart,
} from '../features/search'
export {
  collectQueryRanges,
  createHighlightParts,
  mergeRanges,
  resolveSearchText,
  stripSearchHtml,
  useLmFuseSearch,
  useSearchModal,
} from '../features/search'

export type {
  TagCloudRow,
  TagCloudSourceItem,
  TagCloudViewItem,
  TagEntry,
  TagGroup,
} from '../features/tag'
export {
  buildTagCloudRows,
  buildTagGroups,
  countTaggedPosts,
  createTagId,
  normalizeTags,
  useTagCloud,
  useTagGroups,
} from '../features/tag'

export { useThemeConfig } from '../shared/config'
