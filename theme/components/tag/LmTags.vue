<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTagGroups } from '../../features/tag'
import { resolveFrontmatterCover, resolveFrontmatterText } from '../../shared/frontmatter'

const { t } = useI18n()
const frontmatter = useFrontmatter()
const { groups, totalPosts, totalTags } = useTagGroups()

const pageTitle = computed(() => {
  return resolveFrontmatterText(frontmatter.value.title, t('pages.tags.title'))
})

const pageCover = computed(() => {
  return resolveFrontmatterCover(frontmatter.value)
})

const stats = computed(() => {
  return [
    {
      label: t('pages.tags.stats.tags'),
      value: totalTags.value,
    },
    {
      label: t('pages.tags.stats.posts'),
      value: totalPosts.value,
    },
  ]
})
</script>

<template>
  <section class="lm-tags-page">
    <LmAggregateHeader
      :title="pageTitle"
      :cover="pageCover"
      :stats="stats"
    />

    <div class="lm-tags-page__content">
      <LmTagIndex
        :groups="groups"
        :empty-label="t('pages.tags.empty')"
        :post-count-label="t('pages.tags.postCountLabel')"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.lm-tags-page {
  @apply flex flex-col pb-12 sm:pb-16;
}

.lm-tags-page__content {
  @apply mx-auto w-full max-w-5xl px-4 sm:px-6 xl:px-0;
}
</style>
