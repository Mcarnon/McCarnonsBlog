<script lang="ts" setup>
import type { NavItem } from '../../types'

const props = defineProps<{
  drawerOpen: boolean
  items: NavItem[]
}>()

const emit = defineEmits<{
  toggleMobileDrawer: []
  openSearch: []
}>()
</script>

<template>
  <nav
    class="lm-nav flex flex-col w-full transition-transform duration-250 ease-in-out relative"
  >
    <div class="px-4 py-2 flex gap-3 w-full items-center sm:px-5">
      <LmNavBrand />

      <div class="text-sm leading-6 ml-auto hidden items-center md:flex md:gap-3.5 xl:gap-5">
        <LmNavItem
          v-for="item in props.items"
          :key="item.link"
          :item="item"
        />
      </div>

      <LmNavTools
        :drawer-open="props.drawerOpen"
        @open-search="emit('openSearch')"
        @toggle-mobile-drawer="emit('toggleMobileDrawer')"
      />
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@use '../../styles/mixins/surface' as *;

.lm-nav {
  @include lm-surface-nav;

  border-radius: 0;
  margin-top: 0;
  border-top: none;
  border-left: none;
  border-right: none;
}
</style>
