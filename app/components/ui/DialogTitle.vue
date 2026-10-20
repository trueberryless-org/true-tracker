<script setup lang="ts">
import { DialogTitle, type DialogTitleProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const { class: className, ...props } = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DialogTitle v-bind="props" :class="cn('text-lg leading-none font-semibold tracking-tight', className)">
    <slot />
  </DialogTitle>
</template>
