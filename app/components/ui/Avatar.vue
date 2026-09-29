<script setup lang="ts">
import { AvatarRoot } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const { class: className } = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <AvatarRoot :class="cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)">
    <slot />
  </AvatarRoot>
</template>
