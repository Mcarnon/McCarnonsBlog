<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useArchiveGroups } from '../../features/archive'
import { resolveFrontmatterCover, resolveFrontmatterText } from '../../shared/frontmatter'

const { t } = useI18n()
const frontmatter = useFrontmatter()
const { groups, totalPosts } = useArchiveGroups()

const pageTitle = computed(() => {
  return resolveFrontmatterText(frontmatter.value.title, t('pages.archives.title'))
})

const pageCover = computed(() => {
  return resolveFrontmatterCover(frontmatter.value)
})

const stats = computed(() => {
  return [
    {
      label: t('pages.archives.stats.posts'),
      value: totalPosts.value,
    },
  ]
})
</script>

<template>
  <section class="lm-archives-page">
    <LmAggregateHeader
      :title="pageTitle"
      :cover="pageCover"
      :stats="stats"
    />

    <div class="lm-archives-page__content">
      <LmArchiveTimeline
        :groups="groups"
        :empty-label="t('pages.archives.empty')"
        :unknown-year-label="t('pages.archives.unknownYear')"
        :count-label="t('pages.archives.countLabel')"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.lm-archives-page {
  @apply flex flex-col pb-12 sm:pb-16;
}

.lm-archives-page__content {
  @apply mx-auto w-full max-w-5xl px-4 sm:px-6 xl:px-0;
}
</style>
