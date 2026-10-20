<script setup lang="ts">
import { DropdownMenuLabel, type DropdownMenuLabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const {
  class: className,
  inset,
  ...props
} = defineProps<DropdownMenuLabelProps & { class?: HTMLAttributes['class']; inset?: boolean }>()
</script>

<template>
  <DropdownMenuLabel v-bind="props" :class="cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)">
    <slot />
  </DropdownMenuLabel>
</template>
