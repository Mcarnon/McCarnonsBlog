<script lang="ts" setup>
import { computed } from 'vue'
import { createBackgroundImageStyle, useBackgroundPreload, useBackgroundRuntime, useResolvedBackground } from '../features/background'

const background = useResolvedBackground('app')
const runtimeBackground = useBackgroundRuntime('app', background)

// 全局背景在每个页面都会加载，预加载让下载早于脚本水合开始。
useBackgroundPreload('app')

const placeholderStyle = computed(() => runtimeBackground.placeholderStyle.value)
const hasBaseImageLayer = computed(() => Boolean(runtimeBackground.currentImageUrl.value))
const hasIncomingImageLayer = computed(() => Boolean(runtimeBackground.incomingImageUrl.value))
const incomingImageVisible = computed(() => runtimeBackground.incomingImageVisible.value)

// 全局背景层只消费 app scope 的结果，不读取 hero.cover。
// 这样首页 Hero 是否存在独立封面，不会反向影响整页壳层背景。
const baseImageStyle = computed(() => {
  if (!hasBaseImageLayer.value)
    return {}

  return createBackgroundImageStyle(runtimeBackground.currentImageUrl.value, {
    fixed: background.value.fixed,
    position: background.value.position,
    size: background.value.size,
  })
})

const incomingImageStyle = computed(() => {
  if (!hasIncomingImageLayer.value)
    return {}

  return createBackgroundImageStyle(runtimeBackground.incomingImageUrl.value, {
    fixed: background.value.fixed,
    position: background.value.position,
    size: background.value.size,
  })
})

const overlayStyle = computed(() => ({
  opacity: String(background.value.overlayOpacity),
  background: 'linear-gradient(180deg, var(--lm-c-overlay-base), var(--lm-c-overlay-tint))',
}))
</script>

<template>
  <div class="pointer-events-none inset-0 fixed z-[var(--lm-z-base)] overflow-hidden" aria-hidden="true">
    <div class="lm-bg-layer" :style="placeholderStyle" />
    <div
      v-if="hasBaseImageLayer"
      class="lm-bg-layer"
      :style="baseImageStyle"
    />
    <div
      v-if="hasIncomingImageLayer"
      class="lm-bg-fade-layer"
      :class="incomingImageVisible ? 'opacity-100' : 'opacity-0'"
      :style="incomingImageStyle"
    />
    <div
      class="lm-bg-layer"
      :style="overlayStyle"
    />
  </div>
</template>

<style scoped>
.lm-bg-layer {
  @apply inset-0 absolute;
}

.lm-bg-fade-layer {
  @apply inset-0 absolute transition-opacity duration-500 ease-out;
  will-change: opacity;
}

@media (prefers-reduced-motion: reduce) {
  .lm-bg-fade-layer {
    transition: none;
  }
}
</style>
