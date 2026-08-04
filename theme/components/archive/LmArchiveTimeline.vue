<script setup lang="ts">
import type { ArchiveGroup } from '../../features/archive'
import { useId } from 'vue'
import { useArchiveTimelineState, useArchiveTransitionLeave } from '../../features/archive'

const props = defineProps<{
  groups: ArchiveGroup[]
  emptyLabel: string
  unknownYearLabel: string
  countLabel: string
}>()

const {
  isAccordionMode,
  selectedYear,
  selectedGroup,
  selectionChange,
  selectGroup,
} = useArchiveTimelineState(() => props.groups)

const panelIdPrefix = `${useId()}-archive`

/** 获取当前时间线实例内稳定且唯一的桌面年份面板 ID。 */
function getDesktopPanelId(year: string) {
  return `${panelIdPrefix}-desktop-panel-${encodeURIComponent(year)}`
}

/** 获取控制指定年份面板的按钮 ID。 */
function getTriggerId(year: string) {
  return `${panelIdPrefix}-trigger-${encodeURIComponent(year)}`
}

const {
  leave: handleDesktopLeave,
  releaseLeave: releaseDesktopLeave,
} = useArchiveTransitionLeave(() => {
  return selectionChange.value === 'replace' ? 'opacity' : 'transform'
})
</script>

<template>
  <div v-if="groups.length" class="lm-archive">
    <div
      class="lm-archive__shell"
      :class="{
        'lm-archive__shell--accordion': isAccordionMode,
        'lm-archive__shell--collapsed': !selectedGroup,
        'lm-archive__shell--expanded': selectedGroup,
      }"
    >
      <LmArchiveRail
        :groups="groups"
        :selected-year="selectedYear"
        :is-accordion-mode="isAccordionMode"
        :panel-id-prefix="panelIdPrefix"
        :unknown-year-label="unknownYearLabel"
        :count-label="countLabel"
        @select-year="selectGroup"
      />

      <div
        v-if="!isAccordionMode"
        class="lm-archive__stage"
        :class="{ 'lm-archive__stage--expanded': selectedGroup }"
      >
        <Transition
          :name="selectionChange === 'replace' ? 'lm-archive-panel-swap' : 'lm-archive-panel'"
          @leave="handleDesktopLeave"
          @after-leave="releaseDesktopLeave"
          @leave-cancelled="releaseDesktopLeave"
        >
          <section
            v-if="selectedGroup"
            :id="getDesktopPanelId(selectedGroup.year)"
            :key="selectedGroup.year"
            class="lm-archive__panel"
            role="region"
            :aria-labelledby="getTriggerId(selectedGroup.year)"
          >
            <div class="lm-archive__panel-clip">
              <div class="lm-archive__panel-content">
                <LmArchiveEntryList :entries="selectedGroup.entries" />
              </div>
            </div>
          </section>
        </Transition>
      </div>
    </div>
  </div>

  <div v-else class="lm-archive__empty lm-empty-state">
    {{ emptyLabel }}
  </div>
</template>

<style scoped lang="scss">
.lm-archive {
  @apply flex flex-col;
}

.lm-archive__shell {
  @apply relative grid gap-x-8;
  width: 100%;
  margin-inline: auto;
  grid-template-columns: minmax(0, 12rem) minmax(0, 1fr);
  transition:
    width 0.2s ease,
    grid-template-columns 0.2s ease;
}

.lm-archive__shell--collapsed:not(.lm-archive__shell--accordion) {
  width: 14rem;
  grid-template-columns: minmax(0, 12rem) minmax(0, 0fr);
}

.lm-archive__shell::before {
  content: '';
  position: absolute;
  left: calc(12rem + 1.25rem);
  top: 0.5rem;
  bottom: 0.5rem;
  width: 1px;
  background: color-mix(in srgb, var(--lm-c-brand) 16%, var(--lm-c-border));
}

.lm-archive__shell--accordion {
  width: 100%;
  grid-template-columns: minmax(0, 1fr);
}

.lm-archive__shell--accordion::before {
  left: 0.95rem;
}

.lm-archive__stage {
  display: grid;
  min-width: 0;
  overflow: hidden;
}

.lm-archive__panel {
  display: grid;
  min-width: 0;
  grid-area: 1 / 1;
  grid-template-rows: minmax(0, 1fr);
  opacity: 1;
  transform: translateY(0);
}

.lm-archive-panel-enter-active,
.lm-archive-panel-leave-active {
  transition:
    grid-template-rows 0.2s ease,
    opacity 0.18s ease,
    transform 0.2s ease;
}

.lm-archive-panel-enter-from,
.lm-archive-panel-leave-to {
  grid-template-rows: minmax(0, 0fr);
  opacity: 0;
  transform: translateY(0.25rem);
}

.lm-archive-panel-swap-enter-active,
.lm-archive-panel-swap-leave-active {
  transition: opacity 0.16s ease;
}

.lm-archive-panel-swap-enter-from,
.lm-archive-panel-swap-leave-to {
  opacity: 0;
}

.lm-archive__panel-clip {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.lm-archive__panel-content {
  min-width: 0;
  overflow-wrap: anywhere;
}

@media (prefers-reduced-motion: reduce) {
  .lm-archive__shell,
  .lm-archive-panel-enter-active,
  .lm-archive-panel-leave-active,
  .lm-archive-panel-swap-enter-active,
  .lm-archive-panel-swap-leave-active {
    transition: none;
  }

  .lm-archive-panel-enter-from,
  .lm-archive-panel-leave-to {
    grid-template-rows: minmax(0, 1fr);
    opacity: 1;
    transform: none;
  }

  .lm-archive-panel-swap-enter-from,
  .lm-archive-panel-swap-leave-to {
    opacity: 1;
  }
}
</style>
