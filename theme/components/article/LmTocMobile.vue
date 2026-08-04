<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useArticleTocState } from '../../features/article'
import { hasActiveModalFocusScope, useModalFocusTrap } from '../../shared/browser'

const { t } = useI18n()
const { items, visible, activeLink, handleClick } = useArticleTocState()
const open = ref(false)
const panelRef = ref<HTMLElement>()
const isDesktopToc = useMediaQuery('(min-width: 1280px)')

/** 关闭移动端目录面板，并由焦点域监听恢复滚动与焦点。 */
function closePanel() {
  open.value = false
}

/**
 * 判断除当前目录外是否还有活动浮层，避免操作被上层焦点域覆盖的目录。
 *
 * @returns 存在其他活动浮层焦点域时返回 `true`。
 */
function hasBlockingModalScope() {
  return hasActiveModalFocusScope(panelRef.value)
}

/** 仅在目录为最上层浮层时响应用户关闭操作。 */
function closePanelByUser() {
  if (!hasBlockingModalScope())
    closePanel()
}

/**
 * 在上层浮层活动期间拦截目录的指针与点击事件，避免焦点或导航穿透。
 *
 * @param event - 目录根节点捕获到的交互事件。
 */
function guardPanelInteraction(event: Event) {
  if (!open.value || !hasBlockingModalScope())
    return

  event.preventDefault()
  event.stopPropagation()
}

/** 切换移动端目录面板；已有浮层活动时不创建新的目录焦点域。 */
function togglePanel() {
  if (open.value) {
    closePanelByUser()
    return
  }

  if (!hasActiveModalFocusScope())
    open.value = true
}

const { deactivate } = useModalFocusTrap({
  container: panelRef,
  lockBodyScroll: true,
  onClose: closePanel,
  open,
})

/**
 * 处理移动端目录选择，先同步释放浮层约束，再执行原目录滚动与聚焦行为。
 *
 * @param event - 目录链接的鼠标点击事件；保持同步传递以避免 `currentTarget` 失效。
 */
function onSelect(event: MouseEvent) {
  if (hasBlockingModalScope()) {
    event.preventDefault()
    return
  }

  deactivate({
    restoreFocus: false,
    restoreScroll: false,
  })
  handleClick(event)
  closePanel()
}

watch(isDesktopToc, (desktop) => {
  if (desktop)
    closePanel()
}, { immediate: true })

watch(items, () => {
  closePanel()
})

watch(visible, (isVisible) => {
  if (!isVisible)
    closePanel()
})
</script>

<template>
  <div
    v-if="visible"
    class="lm-toc-mobile xl:hidden"
    @click.capture="guardPanelInteraction"
    @pointerdown.capture="guardPanelInteraction"
  >
    <button
      type="button"
      class="lm-toc-mobile__trigger"
      :aria-expanded="open"
      aria-controls="lm-toc-mobile-panel"
      :aria-label="t('button.openToc')"
      @click="togglePanel"
    >
      <span class="lm-toc-mobile__trigger-icon i-ri-file-list-2-line" />
    </button>

    <Transition name="lm-toc-mobile-fade">
      <button
        v-if="open"
        type="button"
        class="lm-toc-mobile__scrim"
        :aria-label="t('button.closeToc')"
        @click="closePanelByUser"
      />
    </Transition>

    <Transition name="lm-toc-mobile-sheet">
      <section
        v-if="open"
        id="lm-toc-mobile-panel"
        ref="panelRef"
        class="lm-toc-mobile__panel"
        role="dialog"
        aria-modal="true"
        :aria-label="t('toc.label')"
        tabindex="-1"
      >
        <div class="lm-toc-mobile__panel-header">
          <div>
            <p class="lm-toc-mobile__eyebrow">
              {{ t('toc.eyebrow') }}
            </p>
            <h2 class="lm-toc-mobile__title">
              {{ t('toc.title') }}
            </h2>
          </div>

          <button
            type="button"
            class="lm-toc-mobile__close"
            :aria-label="t('button.closeToc')"
            @click="closePanelByUser"
          >
            <span class="i-ri-close-line" />
          </button>
        </div>

        <nav class="lm-toc-mobile__nav">
          <a
            v-for="item in items"
            :key="item.link"
            :href="item.link"
            class="lm-toc-mobile__link"
            :class="{
              'lm-toc-mobile__link--active': activeLink === item.link,
              'lm-toc-mobile__link--nested': item.depth > 0,
            }"
            @click="onSelect"
          >
            {{ item.title }}
          </a>
        </nav>
      </section>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.lm-toc-mobile {
  @apply xl:hidden;
}

.lm-toc-mobile__trigger {
  @apply fixed bottom-5 right-4 z-[var(--lm-z-overlay-trigger)] inline-flex h-11 w-11 items-center justify-center rounded-full p-0 shadow-lg transition-transform duration-200 sm:right-6;
  border: 1px solid color-mix(in srgb, var(--lm-c-brand) 16%, var(--lm-c-border));
  background: color-mix(in srgb, var(--lm-surface-reading-bg) 92%, transparent);
  color: var(--lm-c-text-primary);
  backdrop-filter: blur(14px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.14);

  &:active {
    transform: scale(0.97);
  }

  &::after {
    content: '';
    position: absolute;
    inset: -0.4rem;
    border-radius: inherit;
  }
}

.lm-toc-mobile__trigger-icon {
  @apply text-lg;
  color: var(--lm-c-brand);
}

.lm-toc-mobile__scrim {
  @apply fixed inset-0 z-[var(--lm-z-overlay-scrim)] border-none p-0;
  background: rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(2px);
}

.lm-toc-mobile__panel {
  @apply fixed inset-x-0 bottom-0 z-[var(--lm-z-overlay-panel)] mx-auto flex max-h-[72vh] w-full max-w-3xl flex-col overflow-hidden rounded-[8px];
  border: 1px solid var(--lm-c-border-accent);
  border-bottom: none;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--lm-surface-reading-bg) 96%, transparent) 0%,
    color-mix(in srgb, var(--lm-surface-reading-bg) 92%, transparent) 100%
  );
  box-shadow: 0 -18px 40px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(18px);
}

.lm-toc-mobile__panel-header {
  @apply flex items-start justify-between gap-4 px-5 pb-4 pt-5;
  border-bottom: 1px solid color-mix(in srgb, var(--lm-c-brand) 10%, var(--lm-c-border));
}

.lm-toc-mobile__eyebrow {
  @apply m-0 text-xs font-700 uppercase tracking-[0.16em];
  color: var(--lm-c-text-muted);
}

.lm-toc-mobile__title {
  @apply mt-2 text-lg font-800;
  color: var(--lm-c-text-primary);
}

.lm-toc-mobile__close {
  @apply inline-flex h-9 w-9 items-center justify-center rounded-full border-none p-0 text-base transition-colors;
  background: color-mix(in srgb, var(--lm-c-brand-soft) 52%, transparent);
  color: var(--lm-c-text-secondary);

  &:hover {
    color: var(--lm-c-brand-strong);
  }
}

.lm-toc-mobile__nav {
  @apply flex flex-col gap-1 overflow-y-auto px-3 py-3;
}

.lm-toc-mobile__link {
  @apply relative rounded-2xl px-4 py-3 text-sm leading-6 no-underline transition-colors duration-200;
  color: var(--lm-c-text-secondary);

  &::before {
    content: '';
    position: absolute;
    left: 0.7rem;
    top: 50%;
    width: 0.3rem;
    height: 0.3rem;
    border-radius: var(--lm-radius-full);
    transform: translateY(-50%);
    background: color-mix(in srgb, var(--lm-c-border) 80%, transparent);
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;
  }

  &:hover {
    color: var(--lm-c-brand-strong);
  }
}

.lm-toc-mobile__link--nested {
  @apply pl-8 text-[0.92rem];
}

.lm-toc-mobile__link--active {
  background: color-mix(in srgb, var(--lm-c-brand-soft) 52%, transparent);
  color: color-mix(in srgb, var(--lm-c-brand-strong) 72%, var(--lm-c-text-primary));
  font-weight: 700;

  &::before {
    transform: translateY(-50%) scale(1.2);
    background: var(--lm-c-brand);
  }
}

.lm-toc-mobile-fade-enter-active,
.lm-toc-mobile-fade-leave-active {
  transition: opacity 0.2s ease;
}

.lm-toc-mobile-fade-enter-from,
.lm-toc-mobile-fade-leave-to {
  opacity: 0;
}

.lm-toc-mobile-sheet-enter-active,
.lm-toc-mobile-sheet-leave-active {
  transition:
    transform 0.24s ease,
    opacity 0.24s ease;
}

.lm-toc-mobile-sheet-enter-from,
.lm-toc-mobile-sheet-leave-to {
  opacity: 0;
  transform: translateY(1.4rem);
}

@media (prefers-reduced-motion: reduce) {
  .lm-toc-mobile__trigger,
  .lm-toc-mobile__close,
  .lm-toc-mobile__link,
  .lm-toc-mobile__link::before,
  .lm-toc-mobile-fade-enter-active,
  .lm-toc-mobile-fade-leave-active,
  .lm-toc-mobile-sheet-enter-active,
  .lm-toc-mobile-sheet-leave-active {
    transition: none;
  }

  .lm-toc-mobile-fade-enter-from,
  .lm-toc-mobile-fade-leave-to,
  .lm-toc-mobile-sheet-enter-from,
  .lm-toc-mobile-sheet-leave-to {
    opacity: 1;
    transform: none;
  }
}

@media (min-width: 768px) {
  .lm-toc-mobile__trigger {
    right: 1.6rem;
    height: 2.8rem;
    width: 2.8rem;
  }

  .lm-toc-mobile__panel {
    @apply bottom-4;
    border-bottom: 1px solid var(--lm-c-border-accent);
  }
}
</style>
