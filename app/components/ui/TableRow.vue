<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const { class: className } = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <tr :class="cn('hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors', className)">
    <slot />
  </tr>
</template>
