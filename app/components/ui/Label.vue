<script setup lang="ts">
import { Label, type LabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const { class: className, ...props } = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <Label
    v-bind="props"
    :class="cn('text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)"
  >
    <slot />
  </Label>
</template>
