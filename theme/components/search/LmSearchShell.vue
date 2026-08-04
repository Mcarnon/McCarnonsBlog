<script setup lang="ts">
import { onMounted, ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModalFocusTrap } from '../../shared/browser'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const mounted = ref(false)
const panelRef = ref<HTMLElement>()

useModalFocusTrap({
  container: panelRef,
  lockBodyScroll: true,
  onClose: () => emit('close'),
  open: toRef(props, 'open'),
})

onMounted(() => {
  mounted.value = true
})
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <div class="lm-search-shell">
      <Transition name="lm-search-backdrop">
        <button
          v-if="props.open"
          type="button"
          class="lm-search-shell__backdrop"
          :aria-label="t('button.closeSearch')"
          @click="emit('close')"
        />
      </Transition>

      <Transition name="lm-search-panel">
        <section
          v-if="props.open"
          ref="panelRef"
          class="lm-search-shell__panel"
          role="dialog"
          aria-modal="true"
          :aria-label="t('search.label')"
          tabindex="-1"
        >
          <slot />
        </section>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use '../../styles/mixins/surface' as *;

.lm-search-shell {
  @apply px-4 pt-[8vh] flex pointer-events-none items-start inset-0 justify-center fixed z-[var(--lm-z-modal)];
}

.lm-search-shell__backdrop {
  @apply bg-black/36 pointer-events-auto inset-0 absolute backdrop-blur-[6px];
}

.lm-search-shell__panel {
  @include lm-surface-modal;

  @apply rounded max-w-[720px] w-full pointer-events-auto relative overflow-hidden;
}

.lm-search-backdrop-enter-active,
.lm-search-backdrop-leave-active {
  transition: opacity 0.2s ease;
}

.lm-search-backdrop-enter-from,
.lm-search-backdrop-leave-to {
  opacity: 0;
}

.lm-search-panel-enter-active,
.lm-search-panel-leave-active {
  transition:
    transform 0.26s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}

.lm-search-panel-enter-from,
.lm-search-panel-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.985);
}

@media (prefers-reduced-motion: reduce) {
  .lm-search-backdrop-enter-active,
  .lm-search-backdrop-leave-active,
  .lm-search-panel-enter-active,
  .lm-search-panel-leave-active {
    transition: none;
  }

  .lm-search-backdrop-enter-from,
  .lm-search-backdrop-leave-to,
  .lm-search-panel-enter-from,
  .lm-search-panel-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
