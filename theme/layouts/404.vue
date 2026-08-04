<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getWindow } from '../shared/browser'

const router = useRouter()
const { t } = useI18n()

/** 返回可用的上一页；没有有效来源时回到首页。 */
function goBack() {
  const currentWindow = getWindow()
  const referrer = currentWindow?.document.referrer

  if (currentWindow && referrer && referrer !== currentWindow.location.href) {
    router.back()
    return
  }

  router.push('/')
}
</script>

<template>
  <Layout hide-footer>
    <section class="lm-not-found">
      <div class="lm-not-found__scene">
        <p class="lm-not-found__eyebrow">
          404 MHz / Signal Lost
        </p>

        <h1 class="lm-not-found__title" data-text="信号丢失">
          信号丢失
        </h1>

        <p class="lm-not-found__description">
          这条连接没有收到回应，页面可能已经移动，也可能暂时藏进了背景噪声里。
        </p>

        <div class="lm-not-found__diagnostic" aria-hidden="true">
          <span class="lm-not-found__dot" />
          <span>ROUTE NOT FOUND</span>
          <span class="lm-not-found__divider" />
          <span>RETRY FROM HOME</span>
        </div>

        <div class="lm-not-found__actions">
          <RouterLink class="lm-not-found__action lm-not-found__action--primary" to="/">
            {{ t('button.home') }}
          </RouterLink>

          <button
            type="button"
            class="lm-not-found__action"
            @click="goBack"
          >
            {{ t('button.back') }}
          </button>
        </div>
      </div>
    </section>
  </Layout>
</template>

<style scoped lang="scss">
.lm-not-found {
  @apply relative flex min-h-screen items-center justify-center px-4 py-28 text-center sm:px-6;
}

.lm-not-found::before {
  content: '';
  position: absolute;
  inset: 18% 8% auto;
  height: 24rem;
  pointer-events: none;
  background:
    radial-gradient(circle at 30% 34%, color-mix(in srgb, var(--lm-c-brand) 16%, transparent), transparent 34%),
    radial-gradient(circle at 68% 48%, color-mix(in srgb, var(--lm-c-brand-soft) 30%, transparent), transparent 38%);
  opacity: 0.74;
  filter: blur(22px);
}

.lm-not-found__scene {
  @apply relative mx-auto flex w-full max-w-3xl flex-col items-center;
}

.lm-not-found__eyebrow {
  @apply m-0 text-xs font-700 uppercase tracking-[0.32em];
  color: var(--lm-c-brand-strong);
}

.lm-not-found__title {
  @apply relative m-0 mt-5 text-5xl font-800 leading-none text-[var(--lm-c-text-primary)] sm:text-6xl md:text-7xl;
  letter-spacing: -0.04em;
  text-shadow:
    0 2px 18px rgb(15 23 42 / 0.1),
    -0.045em 0 color-mix(in srgb, var(--lm-c-brand) 38%, transparent),
    0.045em 0 color-mix(in srgb, #ff7aa8 28%, transparent);
}

.lm-not-found__title::before,
.lm-not-found__title::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.44;
}

.lm-not-found__title::before {
  color: color-mix(in srgb, var(--lm-c-brand) 76%, white);
  filter: blur(1.5px);
  transform: translate(-0.07em, 0.02em);
  clip-path: inset(0 0 54% 0);
}

.lm-not-found__title::after {
  color: color-mix(in srgb, #ff7aa8 70%, white);
  filter: blur(1px);
  transform: translate(0.06em, -0.015em);
  clip-path: inset(48% 0 0 0);
}

.lm-not-found__description {
  @apply m-0 mt-5 max-w-2xl text-base leading-8 text-[var(--lm-c-text-secondary)] sm:text-lg;
}

.lm-not-found__diagnostic {
  @apply mt-7 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-600 tracking-[0.18em];
  color: var(--lm-c-text-muted);
  border-color: color-mix(in srgb, var(--lm-c-brand) 12%, var(--lm-c-border));
  background:
    repeating-linear-gradient(0deg, color-mix(in srgb, var(--lm-c-brand) 8%, transparent) 0 1px, transparent 1px 4px),
    color-mix(in srgb, var(--lm-surface-reading-bg) 58%, transparent);
}

.lm-not-found__dot {
  @apply h-2 w-2 rounded-full;
  background: var(--lm-c-brand);
  box-shadow: 0 0 0 0.24rem color-mix(in srgb, var(--lm-c-brand) 16%, transparent);
}

.lm-not-found__divider {
  @apply h-1 w-1 rounded-full;
  background: color-mix(in srgb, var(--lm-c-text-muted) 58%, transparent);
}

.lm-not-found__actions {
  @apply mt-8 flex flex-wrap items-center justify-center gap-3;
}

.lm-not-found__action {
  @apply inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-600 no-underline transition-[border-color,background-color,color,transform,box-shadow] duration-250 ease-out;
  color: var(--lm-c-text-secondary);
  border-color: color-mix(in srgb, var(--lm-c-brand) 18%, var(--lm-c-border));
  background: color-mix(in srgb, var(--lm-surface-reading-bg) 68%, transparent);
}

.lm-not-found__action:hover,
.lm-not-found__action:focus-visible {
  color: var(--lm-c-text-primary);
  border-color: color-mix(in srgb, var(--lm-c-brand) 42%, var(--lm-c-border));
  box-shadow: 0 10px 24px rgb(15 23 42 / 0.08);
  transform: translateY(-2px);
}

.lm-not-found__action--primary {
  color: color-mix(in srgb, var(--lm-c-brand-strong) 78%, var(--lm-c-text-primary));
  background: color-mix(in srgb, var(--lm-c-brand) 14%, transparent);
}

@media (max-width: 640px) {
  .lm-not-found__diagnostic {
    @apply rounded-5 text-[0.68rem] leading-5;
  }
}
</style>
