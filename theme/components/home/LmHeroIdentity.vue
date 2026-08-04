<script lang="ts" setup>
const props = defineProps<{
  accessibleMotto: string
  avatar: string
  authorName: string
  title: string
  subtitle?: string
  hasMotto: boolean
  mottoRenderKey: number
  renderedMotto: string
  shouldFadeMotto: boolean
  shouldShowMotto: boolean
}>()
</script>

<template>
  <div
    v-if="props.avatar"
    class="lm-hero-avatar-badge"
  >
    <img
      class="lm-hero-avatar-image"
      width="96"
      height="96"
      decoding="async"
      :src="props.avatar"
      :alt="props.authorName"
    >
  </div>

  <div class="lm-hero-identity-card">
    <h1 class="lm-hero-title">
      {{ props.title }}
    </h1>
    <p
      v-if="props.subtitle"
      class="lm-hero-subtitle"
    >
      {{ props.subtitle }}
    </p>
  </div>

  <div
    v-if="props.shouldShowMotto"
    class="lm-hero-motto-strip"
  >
    <p
      class="lm-hero-motto-sr"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ props.accessibleMotto }}
    </p>

    <Transition name="lm-hero-motto-fade" mode="out-in">
      <p
        :key="props.shouldFadeMotto ? props.mottoRenderKey : 'typewriter'"
        class="lm-hero-motto"
        aria-hidden="true"
      >
        {{ props.renderedMotto }}
      </p>
    </Transition>

    <!-- 幽灵占位层始终持有完整文案，把条带的最终宽高一次性预定下来；
         打字动画只在其上逐字显示，容器不再随字符数增长而回流（避免累计布局偏移）。 -->
    <p
      class="lm-hero-motto lm-hero-motto--ghost"
      aria-hidden="true"
    >
      {{ props.accessibleMotto }}
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/mixins/surface' as *;

.lm-hero-avatar-badge {
  @apply relative z-[var(--lm-z-content)] flex h-22 w-22 items-center justify-center rounded-full p-1.5 md:h-24 md:w-24;
  @include lm-surface-panel(
    color-mix(in srgb, var(--lm-c-bg-glass) 72%, transparent),
    color-mix(in srgb, var(--lm-c-border) 78%, transparent),
    0 14px 30px rgb(15 23 42 / 0.12),
    var(--lm-hero-surface-blur)
  );
  // Avatar 徽章要比主牌更轻，避免视线先被“壳层”吸走。
  margin-bottom: clamp(0.15rem, 0.8vh, 0.65rem);
}

.lm-hero-avatar-image {
  @apply h-full w-full rounded-full object-cover;
}

.lm-hero-identity-card {
  @apply relative flex flex-col gap-2 px-6 py-5 md:px-8 md:py-6;
  width: fit-content;
  max-width: 100%;
  isolation: isolate;
}

.lm-hero-identity-card::before {
  content: '';
  position: absolute;
  inset: -0.35rem -3.5rem;
  background: color-mix(in srgb, var(--lm-c-bg-glass) 52%, transparent);
  backdrop-filter: blur(calc(var(--lm-hero-surface-blur) + 1px)) saturate(1.08);
  // 主牌承载区应围绕文字主体存在，而不是形成一整块横幅。
  // 这里通过横向 mask 让模糊从文字外缘向两侧逐步衰减，直到边界透明。
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    rgb(0 0 0 / 0.42) 8%,
    rgb(0 0 0 / 0.92) 18%,
    black 50%,
    rgb(0 0 0 / 0.92) 82%,
    rgb(0 0 0 / 0.42) 92%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    rgb(0 0 0 / 0.42) 8%,
    rgb(0 0 0 / 0.92) 18%,
    black 50%,
    rgb(0 0 0 / 0.92) 82%,
    rgb(0 0 0 / 0.42) 92%,
    transparent 100%
  );
  z-index: var(--lm-z-deep-behind);
}

.lm-hero-identity-card::after {
  content: '';
  position: absolute;
  inset: -0.35rem -3.5rem;
  background:
    linear-gradient(
        to right,
        transparent 0%,
        color-mix(in srgb, var(--lm-c-border) 28%, transparent) 12%,
        color-mix(in srgb, var(--lm-c-border-hover) 64%, transparent) 50%,
        color-mix(in srgb, var(--lm-c-border) 28%, transparent) 88%,
        transparent 100%
      )
      top / 100% 1px no-repeat,
    linear-gradient(
        to right,
        transparent 0%,
        color-mix(in srgb, var(--lm-c-border) 22%, transparent) 12%,
        color-mix(in srgb, var(--lm-c-border-hover) 46%, transparent) 50%,
        color-mix(in srgb, var(--lm-c-border) 22%, transparent) 88%,
        transparent 100%
      )
      bottom / 100% 1px no-repeat;
  pointer-events: none;
  z-index: var(--lm-z-behind);
}

.lm-hero-title {
  @apply relative z-[var(--lm-z-raised)] text-4xl leading-tight font-700 text-[var(--lm-c-text-primary)] md:text-5xl xl:text-6xl;
  text-wrap: balance;
  text-shadow:
    0 2px 14px rgb(15 23 42 / 0.08),
    0 1px 0 rgb(255 255 255 / 0.12);
}

.lm-hero-subtitle {
  @apply relative z-[var(--lm-z-raised)] text-base leading-7 text-[var(--lm-c-text-secondary)] md:text-lg;
  // subtitle 仍属于身份主牌的一部分，但它的阅读宽度不应无限跟随 title 变长。
  // 这里把它限制在一个稳定的阅读 measure 内，同时继续服从 Hero 的左右/居中对齐语义。
  width: fit-content;
  max-width: min(100%, 31rem);
  text-wrap: balance;
  text-shadow: 0 1px 10px rgb(15 23 42 / 0.08);
}

.lm-hero-motto-strip {
  // 使用网格堆叠让“幽灵占位层”与“打字层”共享同一单元格，
  // 单元格尺寸由持有完整文案的幽灵层决定，打字过程中容器尺寸保持稳定。
  @apply grid rounded-[12px] px-5 py-3 md:px-6;
  @include lm-surface-nav(
    color-mix(in srgb, var(--lm-c-bg-glass) 60%, transparent),
    color-mix(in srgb, var(--lm-c-border) 54%, transparent),
    0 10px 20px rgb(15 23 42 / 0.08),
    var(--lm-hero-surface-blur)
  );
  // motto 是动态文案，需要一个稳定的最小阅读宽度；
  // 但它又不能像主牌那样永远撑满，所以用 min/max + fit-content 让其按内容弹性增长。
  min-width: min(100%, 28rem);
  width: fit-content;
  max-width: min(100%, 56rem);
  margin-top: 0.1rem;
  box-shadow:
    0 10px 20px rgb(15 23 42 / 0.08),
    inset 0 1px 0 rgb(255 255 255 / 0.1);
}

.lm-hero-motto-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.lm-hero-motto {
  @apply min-h-8 w-full text-base leading-7 text-[var(--lm-c-text-secondary)] md:text-[1.0625rem];
  grid-area: 1 / 1;
  font-family: 'Segoe Print', 'Bradley Hand', 'Lucida Handwriting', 'Comic Sans MS', cursive;
  letter-spacing: 0.01em;
  text-wrap: balance;
}

.lm-hero-motto--ghost {
  visibility: hidden;
}

.lm-hero-motto-fade-enter-active,
.lm-hero-motto-fade-leave-active {
  transition:
    opacity 180ms ease-out,
    transform 180ms ease-out;
}

.lm-hero-motto-fade-enter-from {
  opacity: 0;
  transform: translateY(0.25rem);
}

.lm-hero-motto-fade-leave-to {
  opacity: 0;
  transform: translateY(-0.125rem);
}

@media (prefers-reduced-motion: reduce) {
  .lm-hero-motto-fade-enter-active,
  .lm-hero-motto-fade-leave-active {
    transition: none;
  }

  .lm-hero-motto-fade-enter-from,
  .lm-hero-motto-fade-leave-to {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 767px) {
  .lm-hero-identity-card {
    width: min(100%, 34rem);
  }

  .lm-hero-identity-card::before {
    inset: -0.2rem -1rem;
  }

  .lm-hero-identity-card::after {
    inset: -0.2rem -1rem;
  }

  .lm-hero-subtitle {
    max-width: 100%;
  }

  .lm-hero-motto-strip {
    min-width: min(100%, 20rem);
    max-width: min(100%, 26rem);
  }
}
</style>
