<script setup lang="ts">
const {
  class: className,
  justify = 'left',
  options,
  value,
} = defineProps<{
  class?: string
  justify?: 'left' | 'right'
  options: Option[]
  value: string | undefined
}>()

const option = computed(() => findOption(options, value))
</script>

<template>
  <div
    v-if="option"
    :class="cn('flex items-center whitespace-nowrap', justify === 'right' ? 'justify-end' : 'justify-start', className)"
  >
    <component :is="option.icon" class="mr-2 h-4 w-4" aria-hidden="true" />
    <span>{{ option.label }}</span>
  </div>
</template>
