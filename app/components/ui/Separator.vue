<script setup lang="ts">
import { Separator, type SeparatorProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const {
  class: className,
  decorative = true,
  orientation = 'horizontal',
} = defineProps<SeparatorProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <Separator
    :decorative="decorative"
    :orientation="orientation"
    :class="cn('bg-border shrink-0', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)"
  />
</template>
