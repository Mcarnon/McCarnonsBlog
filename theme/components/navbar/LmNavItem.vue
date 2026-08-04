<script lang="ts" setup>
import type { NavItem } from '../../types'
import { computed } from 'vue'
import { useNavActive, useNavItemState } from '../../features/navigation'

const props = defineProps<{
  item: NavItem
}>()

const itemRef = computed(() => props.item)
const { clearPending } = useNavActive()
const { active, children, hasChildren, itemActive } = useNavItemState(itemRef)
</script>

<template>
  <div
    class="lm-nav-item-shell"
    :class="hasChildren ? 'lm-nav-item-shell--with-children' : undefined"
  >
    <button
      v-if="hasChildren"
      type="button"
      class="lm-nav-item"
      :class="active
        ? 'text-[var(--lm-c-brand)] opacity-92'
        : 'text-[var(--lm-c-text-secondary)] opacity-86'"
      aria-haspopup="menu"
      aria-expanded="false"
    >
      <LmNavLinkContent :item="props.item">
        <span
          class="lm-nav-item__chevron i-ri-arrow-down-s-line"
          aria-hidden="true"
        />
      </LmNavLinkContent>
    </button>

    <AppLink
      v-else
      class="lm-nav-item"
      :class="active
        ? 'text-[var(--lm-c-brand)] opacity-92'
        : 'text-[var(--lm-c-text-secondary)] opacity-86'"
      :to="props.item.link"
      :target="props.item.target"
      :aria-current="itemActive ? 'page' : undefined"
      rel="noopener"
      @click="clearPending"
    >
      <LmNavLinkContent :item="props.item" />
    </AppLink>

    <LmNavSubmenu
      v-if="hasChildren"
      :items="children"
    />
  </div>
</template>

<style lang="scss" scoped>
.lm-nav-item-shell {
  @apply relative inline-flex items-center;
}

.lm-nav-item-shell--with-children::after {
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  height: 0.75rem;
  content: '';
}

.lm-nav-item {
  @apply inline-flex items-center border-0 bg-transparent p-0 font-inherit no-underline transition-[color,opacity] duration-220 ease-in-out hover:text-[var(--lm-c-brand-strong)] cursor-pointer;
}

.lm-nav-item__chevron {
  @apply inline-block text-[1.05em] opacity-70 transition-transform duration-180 ease-out;
}

.lm-nav-item-shell--with-children:hover .lm-nav-item__chevron,
.lm-nav-item-shell--with-children:focus-within .lm-nav-item__chevron {
  transform: rotate(180deg);
}

.lm-nav-item-shell--with-children:hover :deep(.lm-nav-submenu),
.lm-nav-item-shell--with-children:focus-within :deep(.lm-nav-submenu) {
  @apply visible pointer-events-auto opacity-100;

  transform: translateY(0);
}
</style>
