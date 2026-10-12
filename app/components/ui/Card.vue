<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const { class: className } = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div :class="cn('bg-card text-card-foreground rounded-lg border shadow-xs', className)">
    <slot />
  </div>
</template>
