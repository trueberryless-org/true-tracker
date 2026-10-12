<script setup lang="ts">
import { AvatarFallback, type AvatarFallbackProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const { class: className, ...props } = defineProps<AvatarFallbackProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <AvatarFallback
    v-bind="props"
    :class="cn('bg-muted flex h-full w-full items-center justify-center rounded-full', className)"
  >
    <slot />
  </AvatarFallback>
</template>
