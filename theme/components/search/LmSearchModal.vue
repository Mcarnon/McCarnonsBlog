<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <LmFuseSearchProvider
    :open="props.open"
    @close="emit('close')"
  >
    <template
      #default="{
        query,
        results,
        loading,
        hasError,
        selectedIndex,
        hasQuery,
        searching,
        updateQuery,
        navigate,
        onKeydown,
      }"
    >
      <LmSearchShell
        :open="props.open"
        @close="emit('close')"
      >
        <LmSearchHeader
          :query="query"
          @close="emit('close')"
          @keydown="onKeydown"
          @update-query="updateQuery"
        />

        <LmSearchBody
          :loading="loading"
          :searching="searching"
          :has-error="hasError"
          :has-query="hasQuery"
          :results="results"
          :selected-index="selectedIndex"
          @navigate="navigate"
        />
      </LmSearchShell>
    </template>
  </LmFuseSearchProvider>
</template>
