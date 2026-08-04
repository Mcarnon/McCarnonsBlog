<script lang="ts" setup>
import { isClient, useWindowScroll } from '@vueuse/core'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getDocumentElement, getWindow } from '../shared/browser'

const { t } = useI18n()
const { y } = useWindowScroll()

const showBackToTop = computed(() => y.value > 120)

const radius = 24
const circumference = 2 * Math.PI * radius

const strokeOffset = ref(circumference)
let rafId: number | undefined

function updateStrokeOffset() {
  if (!isClient)
    return

  const root = getDocumentElement()
  const currentWindow = getWindow()

  if (!root || !currentWindow)
    return

  const maxScroll = root.scrollHeight - currentWindow.innerHeight
  if (maxScroll <= 0) {
    strokeOffset.value = circumference
    return
  }

  const percentage = Math.min(1, Math.max(0, y.value / maxScroll))
  const next = (1 - percentage) * circumference
  // 只在值变化时更新，避免无谓的响应式触发
  if (Math.abs(strokeOffset.value - next) > 0.5)
    strokeOffset.value = next
}

function tick() {
  updateStrokeOffset()
  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  rafId = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  if (rafId !== undefined)
    cancelAnimationFrame(rafId)
})

function backToTop() {
  if (!isClient)
    return

  getWindow()?.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="lm-back-to-top-stage">
    <button
      class="lm-back-to-top"
      :class="showBackToTop && 'lm-back-to-top--visible'"
      type="button"
      :aria-label="t('button.backToTop')"
      @click="backToTop"
    >
      <svg
        class="lm-back-to-top__ring"
        viewBox="0 0 56 56"
        aria-hidden="true"
      >
        <circle
          class="lm-back-to-top__ring-track"
          cx="28"
          cy="28"
          :r="radius"
        />
        <circle
          class="lm-back-to-top__ring-progress"
          cx="28"
          cy="28"
          :r="radius"
          :stroke-dasharray="`${circumference} ${circumference}`"
          :stroke-dashoffset="strokeOffset"
        />
      </svg>

      <span class="lm-back-to-top__icon i-ri-arrow-up-line" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.lm-back-to-top-stage {
  @apply hidden fixed bottom-6 right-6 z-[var(--lm-z-floating)] md:block;
}

.lm-back-to-top {
  @apply relative inline-flex items-center justify-center rounded-full border-0 bg-transparent p-0 cursor-pointer;
  width: 3.5rem;
  height: 3.5rem;

  opacity: 0;
  pointer-events: none;
  transform: translateY(10px);
  transition:
    opacity 220ms ease,
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1);

  &--visible {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background: var(--lm-c-bg-glass);
    border: 1px solid var(--lm-c-border);
    box-shadow: 0 2px 12px rgb(15 23 42 / 0.1);
    transition:
      border-color 220ms ease,
      box-shadow 220ms ease,
      background-color 220ms ease;
  }

  &:hover::before {
    border-color: var(--lm-c-brand);
    box-shadow:
      0 4px 18px rgb(15 23 42 / 0.14),
      0 0 0 3px var(--lm-c-brand-subtle);
  }

  &:focus-visible {
    outline: none;

    &::before {
      border-color: var(--lm-c-brand);
      box-shadow:
        0 4px 18px rgb(15 23 42 / 0.14),
        0 0 0 3px var(--lm-c-brand-subtle);
    }
  }

  &:active {
    transform: scale(0.94);
  }
}

.lm-back-to-top__icon {
  @apply relative z-1 text-xl text-[var(--lm-c-text-primary)];

  transition: color 220ms ease;
}

.lm-back-to-top:hover .lm-back-to-top__icon,
.lm-back-to-top:focus-visible .lm-back-to-top__icon {
  color: var(--lm-c-brand);
}

.lm-back-to-top__ring {
  @apply absolute z-1;
  top: -2px;
  left: -2px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
}

.lm-back-to-top__ring-track {
  fill: none;
  stroke: var(--lm-c-divider);
  stroke-width: 2;
}

.lm-back-to-top__ring-progress {
  fill: none;
  stroke: var(--lm-c-brand);
  stroke-width: 2;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 120ms linear;
}
</style>
