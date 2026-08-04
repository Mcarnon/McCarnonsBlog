<script lang="ts" setup>
import type { PageData, Post } from 'valaxy'
import { useSiteConfig } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  frontmatter: Post
  data?: PageData
}>()
const siteConfig = useSiteConfig()
const commentEnabled = computed(() => siteConfig.value.comment?.enable !== false && props.frontmatter.comment !== false)
</script>

<template>
  <main>
    <div w="full" flex="~">
      <slot name="main">
        <div class="content" flex="~ col grow" w="full" p="lt-md:0">
          <slot name="main-header" />
          <slot name="main-header-after" />

          <slot name="main-content">
            <div class="markdown-body pb-4 max-w-none prose dark:prose-invert">
              <ValaxyMd :frontmatter="frontmatter">
                <slot name="main-content-md" />
                <slot />
              </ValaxyMd>
            </div>
            <slot name="main-content-after" />
          </slot>
        </div>

        <slot name="main-nav-before" />

        <slot name="main-nav" />

        <slot name="main-nav-after" />

        <slot v-if="commentEnabled" name="comment" />

        <slot name="footer" />
      </slot>
    </div>

    <slot name="aside" />
  </main>
</template>
