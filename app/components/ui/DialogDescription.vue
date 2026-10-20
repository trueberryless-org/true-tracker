<script setup lang="ts">
import { DialogDescription, type DialogDescriptionProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const { class: className, ...props } = defineProps<DialogDescriptionProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DialogDescription v-bind="props" :class="cn('text-muted-foreground text-sm', className)">
    <slot />
  </DialogDescription>
</template>
