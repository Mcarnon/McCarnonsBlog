<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const rawPage = computed(() => {
  const params = route.params as { page?: string | string[] }

  return Array.isArray(params.page)
    ? params.page[0]
    : params.page
})

const parsedPage = computed(() => Number(rawPage.value))

const currentPage = computed(() => {
  if (!Number.isFinite(parsedPage.value))
    return 1

  return Math.max(1, Math.floor(parsedPage.value))
})
</script>

<template>
  <LmHomeContent :cur-page="currentPage" />
</template>

<route lang="yaml">
meta:
  layout: home
</route>
