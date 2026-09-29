<script setup lang="ts">
import { Circle } from '@lucide/vue'
import { RadioGroupIndicator, RadioGroupItem, type RadioGroupItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const { class: className, ...props } = defineProps<RadioGroupItemProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <RadioGroupItem
    v-bind="props"
    :class="
      cn(
        'border-primary text-primary ring-offset-background focus-visible:ring-ring aspect-square h-4 w-4 rounded-full border focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )
    "
  >
    <RadioGroupIndicator class="flex items-center justify-center">
      <Circle class="h-2.5 w-2.5 fill-current text-current" aria-hidden="true" />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
