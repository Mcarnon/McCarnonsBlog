<script setup lang="ts">
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectGroups } from '../../features/project'
import { resolveFrontmatterCover, resolveFrontmatterText } from '../../shared/frontmatter'

const { t } = useI18n()
const frontmatter = useFrontmatter()
const { groups, totalFeatured, totalGroups, totalProjects } = useProjectGroups()

const pageTitle = computed(() => {
  return resolveFrontmatterText(frontmatter.value.title, t('pages.projects.title'))
})

const pageCover = computed(() => {
  return resolveFrontmatterCover(frontmatter.value)
})

const stats = computed(() => {
  return [
    {
      label: t('pages.projects.stats.groups'),
      value: totalGroups.value,
    },
    {
      label: t('pages.projects.stats.projects'),
      value: totalProjects.value,
    },
    {
      label: t('pages.projects.stats.featured'),
      value: totalFeatured.value,
    },
  ]
})
</script>

<template>
  <section class="lm-projects-page">
    <LmAggregateHeader
      :title="pageTitle"
      :cover="pageCover"
      :stats="stats"
    />

    <div class="lm-projects-page__content">
      <div class="lm-projects-page__body markdown-body prose dark:prose-invert">
        <slot />
      </div>

      <LmProjectList
        :groups="groups"
        :empty-label="t('pages.projects.empty')"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.lm-projects-page {
  @apply flex flex-col pb-12 sm:pb-16;
}

.lm-projects-page__content {
  @apply mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-6 xl:px-0;
}

.lm-projects-page__body {
  @apply max-w-none;
}

.lm-projects-page__body:empty {
  @apply hidden;
}
</style>
