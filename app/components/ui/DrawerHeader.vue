<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const { class: className } = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div :class="cn('grid gap-1.5 p-4 text-center sm:text-left', className)">
    <slot />
  </div>
</template>
