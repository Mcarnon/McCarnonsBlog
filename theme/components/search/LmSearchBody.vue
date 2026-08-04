<script setup lang="ts">
import type { LmFuseSearchResult } from '../../features/search'
import { useI18n } from 'vue-i18n'

defineProps<{
  hasError: boolean
  hasQuery: boolean
  loading: boolean
  results: LmFuseSearchResult[]
  searching: boolean
  selectedIndex: number
}>()

const emit = defineEmits<{
  navigate: [result: LmFuseSearchResult]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="lm-search-body">
    <LmSearchState v-if="loading || searching">
      {{ t('search.loading') }}
    </LmSearchState>

    <LmSearchState
      v-else-if="hasError"
      :title="t('search.no_results')"
      :hint="t('search.error_hint')"
    />

    <LmSearchState
      v-else-if="hasQuery && !results.length"
      :title="t('search.no_results')"
      :hint="t('search.no_results_hint')"
    />

    <LmSearchState v-else-if="!hasQuery">
      {{ t('search.placeholder') }}
    </LmSearchState>

    <LmSearchResultList
      v-else
      :results="results"
      :selected-index="selectedIndex"
      @navigate="emit('navigate', $event)"
    />
  </div>
</template>

<style scoped lang="scss">
.lm-search-body {
  @apply max-h-[min(28rem,62vh)] overflow-y-auto p-3;
}
</style>
