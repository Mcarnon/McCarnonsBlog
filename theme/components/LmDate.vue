<script lang="ts" setup>
import { formatDate } from 'valaxy'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  date?: Date | number | string
  inline?: boolean
  label?: string
}>(), {
  inline: false,
  label: 'Published on',
})

const datetime = computed(() => formatDate(props.date || ''))
const rootClass = computed(() => (props.inline ? 'lm-date lm-date--inline' : 'lm-date'))
const labelClass = computed(() => (props.inline ? 'lm-date__label lm-date__label--inline' : 'lm-date__label'))
const valueClass = computed(() => (props.inline ? 'lm-date__value lm-date__value--inline' : 'lm-date__value'))
</script>

<template>
  <dl :class="rootClass">
    <dt :class="labelClass">
      {{ props.label }}
    </dt>
    <dd :class="valueClass">
      <time :datetime="datetime">{{ datetime }}</time>
    </dd>
  </dl>
</template>

<style scoped lang="scss">
.lm-date {
  @apply m-0;
}

.lm-date__label {
  @apply sr-only;
}

.lm-date__value {
  @apply m-0 text-sm leading-6 tracking-[0.01em] font-500;
  color: var(--lm-c-text-secondary);
}

.lm-date--inline {
  @apply inline;
}

.lm-date__label--inline {
  @apply sr-only;
}

.lm-date__value--inline {
  @apply inline text-inherit leading-inherit font-inherit tracking-inherit;
}
</style>
