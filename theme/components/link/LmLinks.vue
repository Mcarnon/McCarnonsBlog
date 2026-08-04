<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLinkGroups } from '../../features/link'
import { resolveFrontmatterCover, resolveFrontmatterText } from '../../shared/frontmatter'

const { t } = useI18n()
const frontmatter = useFrontmatter()
const { groups, statusCheck, totalGroups, totalLinks } = useLinkGroups()

const pageTitle = computed(() => {
  return resolveFrontmatterText(frontmatter.value.title, t('pages.links.title'))
})

const pageCover = computed(() => {
  return resolveFrontmatterCover(frontmatter.value)
})

const stats = computed(() => {
  return [
    {
      label: t('pages.links.stats.groups'),
      value: totalGroups.value,
    },
    {
      label: t('pages.links.stats.links'),
      value: totalLinks.value,
    },
  ]
})
</script>

<template>
  <section class="lm-links-page">
    <LmAggregateHeader
      :title="pageTitle"
      :cover="pageCover"
      :stats="stats"
    />

    <div class="lm-links-page__content">
      <div class="lm-links-page__body markdown-body prose dark:prose-invert">
        <slot />
      </div>

      <LmLinkList
        :groups="groups"
        :empty-label="t('pages.links.empty')"
        :status-check="statusCheck"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.lm-links-page {
  @apply flex flex-col pb-12 sm:pb-16;
}

.lm-links-page__content {
  @apply mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-6 xl:px-0;
}

.lm-links-page__body {
  @apply max-w-none;
}

.lm-links-page__body:empty {
  @apply hidden;
}
</style>
