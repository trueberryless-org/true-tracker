<script setup lang="ts">
import { DropdownMenuSeparator, type DropdownMenuSeparatorProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const { class: className, ...props } = defineProps<DropdownMenuSeparatorProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DropdownMenuSeparator v-bind="props" :class="cn('bg-muted -mx-1 my-1 h-px', className)" />
</template>
