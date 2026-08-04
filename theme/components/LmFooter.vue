<script lang="ts" setup>
import { useSiteConfig, useValaxyConfig } from 'valaxy'
import pkg from 'valaxy/package.json'
import { capitalize, computed } from 'vue'

import { useI18n } from 'vue-i18n'
import { useThemeConfig } from '../shared/config'

const { t } = useI18n()

const config = useValaxyConfig()
const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()

const year = new Date().getFullYear()

const isThisYear = computed(() => {
  return year === themeConfig.value.footer.since
})

const poweredHtml = computed(() => t('footer.powered', [`<a href="${pkg.repository}" target="_blank" rel="noopener">Valaxy</a> v${pkg.version}`]))
const footerIcon = computed(() => themeConfig.value.footer.icon!)
const showFooterIcon = computed(() => Boolean(footerIcon.value.enable && (footerIcon.value.name || footerIcon.value.img)))
const authorName = computed(() => siteConfig.value.author?.name || '')
const themeName = computed(() => config.value.theme || '')
const icpInfo = computed(() => {
  const { icp } = themeConfig.value.footer

  if (!icp)
    return undefined

  if (typeof icp === 'string') {
    return {
      link: 'https://beian.miit.gov.cn/',
      text: icp,
    }
  }

  return {
    link: icp.link || 'https://beian.miit.gov.cn/',
    text: icp.text,
  }
})
</script>

<template>
  <footer class="lm-footer">
    <div class="lm-footer__glow" aria-hidden="true" />

    <div class="lm-footer__inner">
      <div class="lm-footer__copyright">
        <span class="lm-footer__year">
          Copyright
          &copy;
          <template v-if="!isThisYear">
            {{ themeConfig.footer.since }} -
          </template>
          {{ year }}
        </span>

        <a
          v-if="showFooterIcon"
          class="lm-footer__icon"
          :href="footerIcon.url || undefined"
          :target="footerIcon.url ? '_blank' : undefined"
          :title="footerIcon.title"
          :style="{ color: footerIcon.color }"
          rel="noopener"
        >
          <img
            v-if="footerIcon.img"
            class="lm-footer__icon-img"
            :src="footerIcon.img"
            :alt="footerIcon.title || 'footer icon'"
          >
          <span v-else :class="footerIcon.name" />
        </a>

        <span class="lm-footer__author">{{ authorName }}</span>
      </div>

      <div v-if="themeConfig.footer.powered" class="lm-footer__powered">
        <span v-html="poweredHtml" />
        <span class="lm-footer__dot" aria-hidden="true" />
        <span>
          {{ t('footer.theme') }}
          <a
            :href="themeConfig.pkg.homepage"
            :title="`valaxy-theme-${themeName}`"
            target="_blank"
            rel="noopener"
          >
            {{ capitalize(themeName) }}
          </a>
          v{{ themeConfig.pkg.version }}
        </span>
      </div>

      <a
        v-if="icpInfo"
        :href="icpInfo.link"
        target="_blank"
        rel="noopener"
        class="lm-footer__icp"
      >
        {{ icpInfo.text }}
      </a>

      <slot />
    </div>
  </footer>
</template>

<style scoped lang="scss">
.lm-footer {
  @apply relative z-[var(--lm-z-content)] px-4 pb-7 pt-10 text-center text-sm leading-7;
  color: var(--lm-c-text-secondary);
}

.lm-footer__glow {
  @apply pointer-events-none absolute left-1/2 top-0 h-px w-[min(34rem,72vw)] -translate-x-1/2;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--lm-c-brand) 58%, transparent), transparent);
}

.lm-footer__inner {
  @apply mx-auto flex max-w-4xl flex-col items-center gap-2;
}

.lm-footer__copyright {
  @apply relative inline-flex flex-wrap items-center justify-center gap-2.5 rounded-full px-4 py-1.5;
  color: var(--lm-c-text-secondary);
  background:
    radial-gradient(circle at 18% 0%, color-mix(in srgb, var(--lm-c-brand) 14%, transparent), transparent 42%),
    color-mix(in srgb, var(--lm-c-bg-glass) 28%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--lm-c-border) 58%, transparent);
}

.lm-footer__year,
.lm-footer__author {
  @apply whitespace-nowrap;
}

.lm-footer__icon {
  @apply inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full no-underline transition-[color,transform,background-color] duration-220 ease-out;
  background: color-mix(in srgb, currentColor 10%, transparent);
}

.lm-footer__icon-img {
  @apply h-full w-full object-cover;
}

.lm-footer__icon:hover {
  transform: translateY(-1px) rotate(-8deg);
  background: color-mix(in srgb, currentColor 16%, transparent);
}

.lm-footer__powered {
  @apply flex flex-wrap items-center justify-center gap-2 text-xs;
  color: var(--lm-c-text-muted);
}

.lm-footer__powered :deep(a),
.lm-footer__icp {
  @apply no-underline transition-colors duration-220 ease-out;
  color: var(--lm-c-link);
}

.lm-footer__powered :deep(a:hover),
.lm-footer__icp:hover {
  color: var(--lm-c-text-primary);
}

.lm-footer__dot {
  @apply h-1 w-1 rounded-full;
  background: color-mix(in srgb, var(--lm-c-brand) 70%, transparent);
}

.lm-footer__icp {
  @apply text-xs;
}
</style>
