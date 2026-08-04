<script setup lang="ts">
import { useAddonConfig, useFrontmatter, useSiteConfig } from 'valaxy'
import { computed, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'

type CommentProvider = 'waline'

const WalineComment = defineAsyncComponent(() => import('../components/plugins/LmWaline.vue'))

const { t } = useI18n()
const siteConfig = useSiteConfig()
const frontmatter = useFrontmatter()
const waline = useAddonConfig('valaxy-addon-waline')

const provider = computed<CommentProvider | ''>(() => {
  if (waline.value)
    return 'waline'

  return ''
})

const enabled = computed(() => {
  return siteConfig.value.comment?.enable !== false
    && frontmatter.value.comment !== false
    && !!provider.value
})

const providerComponent = computed(() => {
  if (provider.value === 'waline')
    return WalineComment

  return null
})
</script>

<template>
  <section
    v-if="enabled"
    class="lm-comment comment"
    :aria-label="t('comment.label')"
  >
    <div class="lm-comment__content">
      <div class="lm-comment__body">
        <component :is="providerComponent" />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.lm-comment {
  @apply w-full px-4 pt-6 sm:px-6 xl:px-0;
}

.lm-comment__content {
  @apply w-full border-t pt-4;
  border-color: color-mix(in srgb, var(--lm-c-brand) 16%, var(--lm-c-border));
}

.lm-comment__body {
  @apply w-full;
}
</style>
