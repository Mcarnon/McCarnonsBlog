<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'
import { useThemeConfig } from '../../shared/config'

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
const navbarOptions = computed(() => themeConfig.value.navbarOptions ?? {})
const siteTitle = computed(() => siteConfig.value.title || '')
const navbarTitle = computed(() => {
  const title = navbarOptions.value.title

  return title || siteTitle.value
})
const siteFavicon = computed(() => siteConfig.value.favicon || '')
// 优先使用小体积的专用 logo，避免强制复用可能很大的站点 favicon。
const navLogo = computed(() => navbarOptions.value.logo || siteFavicon.value)
const showLogo = computed(() => navbarOptions.value.showFavicon !== false && Boolean(navLogo.value))
</script>

<template>
  <RouterLink
    class="lm-nav-brand"
    to="/"
    :aria-label="navbarTitle"
  >
    <img
      v-if="showLogo"
      class="lm-nav-brand__logo"
      width="32"
      height="32"
      alt="logo"
      decoding="async"
      :src="navLogo"
    >
    <span class="lm-nav-brand__title">{{ navbarTitle }}</span>
  </RouterLink>
</template>

<style lang="scss" scoped>
.lm-nav-brand {
  @apply inline-flex items-center gap-2 text-[var(--lm-c-text-primary)] no-underline;
}

.lm-nav-brand__logo {
  @apply block shrink-0;
  // width/height 属性提供加载前的尺寸占位（避免 unsized-image 引发布局偏移），
  // 最终渲染尺寸仍由 CSS 接管，非正方形 logo 也能保持原始比例。
  width: auto;
  height: 32px;
}

.lm-nav-brand__title {
  @apply hidden text-sm leading-[1.2] font-700 sm:text-base md:inline;
}
</style>
