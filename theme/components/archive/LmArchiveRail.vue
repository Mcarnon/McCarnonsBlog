<script setup lang="ts">
import type { ArchiveGroup } from '../../features/archive'
import { useArchiveTransitionLeave } from '../../features/archive'

defineProps<{
  groups: ArchiveGroup[]
  selectedYear: string | null
  isAccordionMode: boolean
  panelIdPrefix: string
  unknownYearLabel: string
  countLabel: string
}>()

const emit = defineEmits<{
  (e: 'selectYear', year: string): void
}>()

/** 将缺失年份的内部占位值转换为本地化展示文本。 */
function displayYear(year: string, unknownYearLabel: string) {
  return year === 'Unknown' ? unknownYearLabel : year
}

/** 获取当前时间线实例内稳定且唯一的年份面板 ID。 */
function getPanelId(year: string, panelIdPrefix: string, mode: 'desktop' | 'mobile') {
  return `${panelIdPrefix}-${mode}-panel-${encodeURIComponent(year)}`
}

/** 获取控制指定年份面板的按钮 ID。 */
function getTriggerId(year: string, panelIdPrefix: string) {
  return `${panelIdPrefix}-trigger-${encodeURIComponent(year)}`
}

const {
  leave: handleMobileLeave,
  releaseLeave: releaseMobileLeave,
} = useArchiveTransitionLeave(() => 'grid-template-rows')
</script>

<template>
  <div class="lm-archive-rail" :class="{ 'lm-archive-rail--accordion': isAccordionMode }">
    <section
      v-for="group in groups"
      :key="group.year"
      class="lm-archive-rail__block"
      :class="{ 'lm-archive-rail__block--active': selectedYear === group.year }"
    >
      <button
        :id="getTriggerId(group.year, panelIdPrefix)"
        type="button"
        class="lm-archive-rail__button"
        :aria-controls="selectedYear === group.year ? getPanelId(group.year, panelIdPrefix, isAccordionMode ? 'mobile' : 'desktop') : undefined"
        :aria-expanded="selectedYear === group.year"
        @click="emit('selectYear', group.year)"
      >
        <span class="lm-archive-rail__year">
          {{ displayYear(group.year, unknownYearLabel) }}
        </span>

        <span class="lm-archive-rail__meta">
          <span class="lm-archive-rail__count">{{ group.count }}</span>
          <span class="lm-archive-rail__unit">{{ countLabel }}</span>
        </span>
      </button>

      <Transition
        name="lm-archive-rail-panel"
        @leave="handleMobileLeave"
        @after-leave="releaseMobileLeave"
        @leave-cancelled="releaseMobileLeave"
      >
        <div
          v-if="isAccordionMode && selectedYear === group.year"
          :id="getPanelId(group.year, panelIdPrefix, 'mobile')"
          :key="group.year"
          class="lm-archive-rail__mobile-panel"
          role="region"
          :aria-labelledby="getTriggerId(group.year, panelIdPrefix)"
        >
          <div class="lm-archive-rail__mobile-panel-clip">
            <div class="lm-archive-rail__mobile-panel-content">
              <LmArchiveEntryList :entries="group.entries" />
            </div>
          </div>
        </div>
      </Transition>
    </section>
  </div>
</template>

<style scoped lang="scss">
.lm-archive-rail {
  @apply flex flex-col gap-5;
}

.lm-archive-rail__block {
  @apply relative;
}

.lm-archive-rail__button {
  @apply relative flex w-full items-center justify-between px-0 py-3 text-left transition-[color,transform] duration-220 ease-out;
  background: transparent;
  border: 0;
}

.lm-archive-rail__button::before {
  content: '';
  @apply absolute rounded-full;
  left: calc(100% + 0.9rem);
  top: 1.05rem;
  width: 0.7rem;
  height: 0.7rem;
  border: 2px solid color-mix(in srgb, var(--lm-c-brand) 28%, white);
  background: color-mix(in srgb, var(--lm-c-brand) 88%, white);
  box-shadow: 0 0 0 0.22rem color-mix(in srgb, var(--lm-c-brand-soft) 36%, transparent);
}

.lm-archive-rail__button:hover,
.lm-archive-rail__button:focus-visible {
  transform: translateX(0.12rem);
}

.lm-archive-rail__year {
  @apply inline-flex items-center text-lg leading-none font-800;
  color: var(--lm-c-text-primary);
}

.lm-archive-rail__meta {
  @apply inline-flex items-baseline gap-1.5;
}

.lm-archive-rail__count {
  @apply text-base leading-none font-800;
  color: color-mix(in srgb, var(--lm-c-brand) 96%, var(--lm-c-text-secondary));
}

.lm-archive-rail__unit {
  @apply text-[0.78rem] leading-none font-700;
  color: var(--lm-c-text-muted);
}

.lm-archive-rail__block--active .lm-archive-rail__year,
.lm-archive-rail__button:hover .lm-archive-rail__year,
.lm-archive-rail__button:focus-visible .lm-archive-rail__year {
  color: color-mix(in srgb, var(--lm-c-brand) 96%, var(--lm-c-text-secondary));
}

.lm-archive-rail__mobile-panel {
  display: grid;
  min-width: 0;
  grid-template-rows: minmax(0, 1fr);
  opacity: 1;
}

.lm-archive-rail-panel-enter-active,
.lm-archive-rail-panel-leave-active {
  transition:
    grid-template-rows 0.2s ease,
    opacity 0.18s ease;
}

.lm-archive-rail-panel-enter-from,
.lm-archive-rail-panel-leave-to {
  grid-template-rows: minmax(0, 0fr);
  opacity: 0;
}

.lm-archive-rail__mobile-panel-clip {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.lm-archive-rail__mobile-panel-content {
  @apply pt-3 pl-5;
  min-width: 0;
  overflow-wrap: anywhere;
}

.lm-archive-rail--accordion {
  @apply gap-2.5;
}

.lm-archive-rail--accordion .lm-archive-rail__button {
  @apply pl-8 pr-0 py-3;
}

.lm-archive-rail--accordion .lm-archive-rail__button::before {
  left: 0.63rem;
}

.lm-archive-rail--accordion .lm-archive-rail__button:hover,
.lm-archive-rail--accordion .lm-archive-rail__button:focus-visible {
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .lm-archive-rail__button {
    transition-property: color;
  }

  .lm-archive-rail__button:hover,
  .lm-archive-rail__button:focus-visible {
    transform: none;
  }

  .lm-archive-rail-panel-enter-active,
  .lm-archive-rail-panel-leave-active {
    transition: none;
  }

  .lm-archive-rail-panel-enter-from,
  .lm-archive-rail-panel-leave-to {
    grid-template-rows: minmax(0, 1fr);
    opacity: 1;
  }
}
</style>
