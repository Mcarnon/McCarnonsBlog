<script lang="ts" setup>
import { isClient, useWindowScroll } from '@vueuse/core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getDocumentElement, getWindow } from '../shared/browser'

const { t } = useI18n()
const { y } = useWindowScroll()

// Helper 只在用户已经明显离开首屏后出现，避免和 Hero 首屏视觉抢焦点。
const showBackToTop = computed(() => y.value > 120)

// 整只猫爪共享同一条填充水平线：主掌垫和脚趾都按同一高度被裁切。
// 这样用户看到的是“整只猫爪逐步被填满”，而不是五块独立图形各自长进度。
const scrollProgress = computed(() => {
  if (!isClient)
    return 0

  const root = getDocumentElement()
  const currentWindow = getWindow()

  if (!root || !currentWindow)
    return 0

  const maxScroll = root.scrollHeight - currentWindow.innerHeight
  if (maxScroll <= 0)
    return 0

  return Math.min(100, Math.max(0, (y.value / maxScroll) * 100))
})

const pawFillRect = computed(() => {
  const bounds = { x: 92, y: 118, width: 320, height: 256 }
  const height = bounds.height * (scrollProgress.value / 100)

  return {
    ...bounds,
    y: bounds.y + bounds.height - height,
    height,
  }
})

/** 将浏览器窗口平滑滚动到页面顶部。 */
function backToTop() {
  if (!isClient)
    return

  getWindow()?.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="lm-helper-stage">
    <Transition name="lm-helper-paw">
      <button
        v-if="showBackToTop"
        class="lm-helper-paw"
        type="button"
        :aria-label="t('button.backToTop')"
        @click="backToTop"
      >
        <svg
          class="lm-helper-paw-svg"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <mask id="lm-helper-paw-shape-mask" maskUnits="userSpaceOnUse">
              <rect width="512" height="512" fill="black" />
              <ellipse
                cx="295.77"
                cy="176.77"
                rx="38.75"
                ry="29.72"
                transform="translate(55.53 423.78) rotate(-76.66)"
                fill="white"
              />
              <ellipse
                cx="212.93"
                cy="176.77"
                rx="29.72"
                ry="38.75"
                transform="translate(-35.04 53.89) rotate(-13.34)"
                fill="white"
              />
              <ellipse
                cx="148.91"
                cy="240.32"
                rx="26.12"
                ry="34.05"
                transform="translate(-100.21 106.65) rotate(-30)"
                fill="white"
              />
              <ellipse
                cx="363.09"
                cy="231.51"
                rx="34.05"
                ry="26.12"
                transform="translate(-18.94 430.2) rotate(-60)"
                fill="white"
              />
              <path
                d="M324.5,282.26c-11.49-19.8-36.22-33.5-64.9-33.5s-53.41,13.7-64.9,33.5c-20.53,9.58-33.5,23.62-33.5,39.28,0,28.87,44.05,52.27,98.4,52.27s98.4-23.4,98.4-52.27c0-15.66-12.97-29.7-33.5-39.28Z"
                fill="white"
              />
            </mask>
          </defs>

          <g class="lm-helper-paw-base">
            <ellipse
              cx="295.77"
              cy="176.77"
              rx="38.75"
              ry="29.72"
              transform="translate(55.53 423.78) rotate(-76.66)"
            />
            <ellipse
              cx="212.93"
              cy="176.77"
              rx="29.72"
              ry="38.75"
              transform="translate(-35.04 53.89) rotate(-13.34)"
            />
            <ellipse
              cx="148.91"
              cy="240.32"
              rx="26.12"
              ry="34.05"
              transform="translate(-100.21 106.65) rotate(-30)"
            />
            <ellipse
              cx="363.09"
              cy="231.51"
              rx="34.05"
              ry="26.12"
              transform="translate(-18.94 430.2) rotate(-60)"
            />
            <path d="M324.5,282.26c-11.49-19.8-36.22-33.5-64.9-33.5s-53.41,13.7-64.9,33.5c-20.53,9.58-33.5,23.62-33.5,39.28,0,28.87,44.05,52.27,98.4,52.27s98.4-23.4,98.4-52.27c0-15.66-12.97-29.7-33.5-39.28Z" />
          </g>

          <g mask="url(#lm-helper-paw-shape-mask)">
            <rect
              class="lm-helper-paw-progress"
              :x="pawFillRect.x"
              :y="pawFillRect.y"
              :width="pawFillRect.width"
              :height="pawFillRect.height"
            />
          </g>

          <g class="lm-helper-paw-outline">
            <ellipse
              cx="295.77"
              cy="176.77"
              rx="38.75"
              ry="29.72"
              transform="translate(55.53 423.78) rotate(-76.66)"
            />
            <ellipse
              cx="212.93"
              cy="176.77"
              rx="29.72"
              ry="38.75"
              transform="translate(-35.04 53.89) rotate(-13.34)"
            />
            <ellipse
              cx="148.91"
              cy="240.32"
              rx="26.12"
              ry="34.05"
              transform="translate(-100.21 106.65) rotate(-30)"
            />
            <ellipse
              cx="363.09"
              cy="231.51"
              rx="34.05"
              ry="26.12"
              transform="translate(-18.94 430.2) rotate(-60)"
            />
            <path d="M324.5,282.26c-11.49-19.8-36.22-33.5-64.9-33.5s-53.41,13.7-64.9,33.5c-20.53,9.58-33.5,23.62-33.5,39.28,0,28.87,44.05,52.27,98.4,52.27s98.4-23.4,98.4-52.27c0-15.66-12.97-29.7-33.5-39.28Z" />
          </g>

          <path
            class="lm-helper-paw-arrow"
            d="M256 295 L228 325 M256 295 L284 325"
          />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.lm-helper-stage {
  @apply hidden fixed xl:bottom-3 md:bottom-12 right-5 z-[var(--lm-z-floating)] md:block;
}

.lm-helper-paw {
  @apply inline-flex items-center justify-center border-none bg-transparent p-0 cursor-pointer;
  width: 3.5rem;
  height: 3.5rem;

  filter: drop-shadow(0 14px 24px rgb(15 23 42 / 0.16))
    drop-shadow(0 0 0 color-mix(in srgb, var(--lm-c-brand) 0%, transparent));
  transition:
    transform 220ms ease,
    filter 220ms ease;
  transform-origin: center;
}

.lm-helper-paw:hover {
  transform: translateY(-2px) scale(1.018);
  filter: drop-shadow(0 18px 28px rgb(15 23 42 / 0.18)) drop-shadow(0 0 8px var(--lm-c-brand-subtle));
}

.lm-helper-paw:focus-visible {
  outline: none;
  transform: translateY(-2px) scale(1.018);
  filter: drop-shadow(0 18px 28px rgb(15 23 42 / 0.18))
    drop-shadow(0 0 10px color-mix(in srgb, var(--lm-c-brand) 12%, transparent));
}

.lm-helper-paw-svg {
  width: 5.25rem;
  height: 5.25rem;
  overflow: visible;
}

.lm-helper-paw-base {
  fill: color-mix(in srgb, var(--lm-surface-panel-bg) 98%, var(--lm-c-bg-base));
}

.lm-helper-paw-progress {
  fill: var(--lm-c-brand);
  transition:
    y 260ms ease,
    height 260ms ease,
    fill 220ms ease;
}

.lm-helper-paw-outline {
  fill: none;
  stroke: color-mix(in srgb, var(--lm-c-border-hover) 88%, white 10%);
  stroke-width: 6.5;
  transition: stroke 220ms ease;
}

.lm-helper-paw-arrow {
  stroke: var(--lm-c-text-primary);
  stroke-width: 14;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition:
    stroke 220ms ease,
    transform 220ms ease;
  transform-origin: center;
}

.lm-helper-paw:hover .lm-helper-paw-outline,
.lm-helper-paw:focus-visible .lm-helper-paw-outline {
  stroke: color-mix(in srgb, var(--lm-c-brand) 40%, var(--lm-c-border-hover));
}

.lm-helper-paw:hover .lm-helper-paw-arrow,
.lm-helper-paw:focus-visible .lm-helper-paw-arrow {
  transform: translateY(-4px);
}

.lm-helper-paw-enter-active,
.lm-helper-paw-leave-active {
  transition:
    opacity 220ms ease,
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.lm-helper-paw-enter-from,
.lm-helper-paw-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
