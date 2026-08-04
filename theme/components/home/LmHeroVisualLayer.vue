<script lang="ts" setup>
import type { CSSProperties } from 'vue'

const props = defineProps<{
  hasHeroCover: boolean
  hasBaseImageLayer: boolean
  hasIncomingImageLayer: boolean
  hasHeroVisualLayer: boolean
  incomingImageVisible: boolean
  baseImageStyle: CSSProperties
  incomingImageStyle: CSSProperties
  overlayStyle: CSSProperties
}>()
</script>

<template>
  <div
    v-if="props.hasHeroCover && props.hasBaseImageLayer"
    class="lm-hero-bg-layer"
    :style="props.baseImageStyle"
  />
  <div
    v-if="props.hasHeroCover && props.hasIncomingImageLayer"
    class="lm-hero-bg-fade-layer"
    :class="props.incomingImageVisible ? 'opacity-100' : 'opacity-0'"
    :style="props.incomingImageStyle"
  />
  <div
    v-if="props.hasHeroCover && props.hasHeroVisualLayer"
    class="lm-hero-bg-layer"
    :style="props.overlayStyle"
  />
</template>

<style scoped lang="scss">
.lm-hero-bg-layer {
  @apply inset-0 absolute;
}

.lm-hero-bg-fade-layer {
  @apply inset-0 absolute transition-opacity duration-500 ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .lm-hero-bg-fade-layer {
    transition: none;
  }
}
</style>
