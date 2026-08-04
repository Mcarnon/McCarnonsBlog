<script lang="ts" setup>
import type { NavItem } from '../../types'
import { computed, ref, watch } from 'vue'
import { useNavActive, useNavItemState } from '../../features/navigation'

const props = defineProps<{
  item: NavItem
}>()

const emit = defineEmits<{
  navigate: [item: NavItem]
}>()

const itemRef = computed(() => props.item)
const { isActive } = useNavActive()
const { active, childActive, hasChildren } = useNavItemState(itemRef)
const expanded = ref(childActive.value)

watch(childActive, (active) => {
  if (active)
    expanded.value = true
})

/** 在展开与收起状态之间切换当前移动端子菜单。 */
function toggleSubmenu() {
  expanded.value = !expanded.value
}
</script>

<template>
  <div class="lm-mobile-nav-group">
    <button
      type="button"
      class="lm-mobile-nav-item"
      :class="active
        ? 'text-[var(--lm-c-brand)] bg-[color-mix(in_srgb,var(--lm-c-brand-soft)_42%,transparent)]'
        : 'text-[var(--lm-c-text-secondary)] hover:text-[var(--lm-c-brand)]'"
      :aria-expanded="hasChildren ? expanded : undefined"
      :aria-haspopup="hasChildren ? 'menu' : undefined"
      @click="hasChildren ? toggleSubmenu() : emit('navigate', props.item)"
    >
      <LmNavLinkContent :item="props.item">
        <span
          v-if="hasChildren"
          class="lm-mobile-nav-item__chevron i-ri-arrow-down-s-line"
          :class="expanded ? 'lm-mobile-nav-item__chevron--expanded' : undefined"
          aria-hidden="true"
        />
      </LmNavLinkContent>
    </button>

    <Transition name="lm-mobile-nav-submenu">
      <div
        v-if="hasChildren && expanded"
        class="lm-mobile-nav-submenu"
        role="menu"
      >
        <button
          v-for="child in props.item.items"
          :key="child.link"
          type="button"
          class="lm-mobile-nav-subitem"
          :class="isActive(child.link)
            ? 'text-[var(--lm-c-brand)] bg-[color-mix(in_srgb,var(--lm-c-brand-soft)_36%,transparent)]'
            : 'text-[var(--lm-c-text-secondary)] hover:text-[var(--lm-c-brand)]'"
          role="menuitem"
          @click="emit('navigate', child)"
        >
          <LmNavLinkContent :item="child" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.lm-mobile-nav-group {
  @apply border-b border-[var(--lm-c-divider)] last:border-b-0;
}

.lm-mobile-nav-item,
.lm-mobile-nav-subitem {
  @apply w-full text-sm no-underline inline-flex items-center transition-[color,background-color] duration-180 ease-out;
}

.lm-mobile-nav-item {
  @apply min-h-11 px-4 py-3;
}

.lm-mobile-nav-submenu {
  @apply flex flex-col border-t border-[var(--lm-c-divider)] bg-[color-mix(in_srgb,var(--lm-c-bg-base)_28%,transparent)] py-1;
}

.lm-mobile-nav-subitem {
  @apply min-h-10 px-8 py-2.5;
}

.lm-mobile-nav-item__chevron {
  @apply text-[1.05em] opacity-65 transition-transform duration-180 ease-out;
}

.lm-mobile-nav-item__chevron--expanded {
  transform: rotate(180deg);
}

.lm-mobile-nav-submenu-enter-active,
.lm-mobile-nav-submenu-leave-active {
  overflow: hidden;
  transition:
    opacity 0.16s ease-out,
    transform 0.16s ease-out;
}

.lm-mobile-nav-submenu-enter-from,
.lm-mobile-nav-submenu-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}

@media (prefers-reduced-motion: reduce) {
  .lm-mobile-nav-item,
  .lm-mobile-nav-subitem,
  .lm-mobile-nav-item__chevron,
  .lm-mobile-nav-submenu-enter-active,
  .lm-mobile-nav-submenu-leave-active {
    transition: none;
  }

  .lm-mobile-nav-submenu-enter-from,
  .lm-mobile-nav-submenu-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
