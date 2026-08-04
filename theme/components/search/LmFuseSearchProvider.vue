<script setup lang="ts">
import type { LmFuseSearchResult } from '../../features/search'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLmFuseSearch } from '../../features/search'
import { createDebouncedFunction } from '../../shared/browser'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

/** 用户停止输入后触发搜索查询的防抖等待毫秒数。 */
const SEARCH_QUERY_DEBOUNCE_MS = 180

/** 搜索输入框当前显示的即时查询文本。 */
const query = ref('')
/** 经防抖后实际驱动 Fuse 搜索的查询文本。 */
const debouncedQuery = ref('')
const selectedIndex = ref(-1)
const router = useRouter()
const { hasError, load, loading, results } = useLmFuseSearch(debouncedQuery)
/** 将最新查询延迟同步到搜索功能，减少连续输入期间的重复检索。 */
const updateDebouncedQuery = createDebouncedFunction((value: string) => {
  debouncedQuery.value = value
}, SEARCH_QUERY_DEBOUNCE_MS)

const hasQuery = computed(() => Boolean(query.value.trim()))
const searching = computed(() => hasQuery.value && query.value.trim() !== debouncedQuery.value)

/** 弹窗状态变化时按需加载搜索索引，并在关闭时重置查询与选中项。 */
watch(
  () => props.open,
  async (open) => {
    if (!open) {
      query.value = ''
      debouncedQuery.value = ''
      selectedIndex.value = -1
      return
    }

    selectedIndex.value = -1
    await load()
  },
)

watch(results, (value) => {
  if (!value.length) {
    selectedIndex.value = -1
    return
  }

  if (selectedIndex.value >= value.length)
    selectedIndex.value = value.length - 1
})

watch(query, (value) => {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    updateDebouncedQuery.cancel()
    debouncedQuery.value = ''
    selectedIndex.value = -1
    return
  }

  updateDebouncedQuery(normalizedValue)
})

onUnmounted(() => {
  updateDebouncedQuery.cancel()
})

/** 导航到选中的搜索结果，并通知上层关闭搜索弹窗。 */
function navigate(result: LmFuseSearchResult) {
  router.push(result.id)
  emit('close')
}

/** 使用输入框的新值更新即时查询文本。 */
function updateQuery(value: string) {
  query.value = value
}

/** 处理结果列表的键盘选择与导航操作。 */
function onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (!results.value.length)
        return
      selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!results.value.length)
        return
      selectedIndex.value = selectedIndex.value <= 0 ? -1 : selectedIndex.value - 1
      break
    case 'Enter':
      event.preventDefault()
      if (results.value[selectedIndex.value])
        navigate(results.value[selectedIndex.value])
      break
  }
}
</script>

<template>
  <slot
    :query="query"
    :results="results"
    :loading="loading"
    :has-query="hasQuery"
    :searching="searching"
    :has-error="hasError"
    :selected-index="selectedIndex"
    :update-query="updateQuery"
    :navigate="navigate"
    :on-keydown="onKeydown"
  />
</template>
