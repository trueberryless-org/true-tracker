<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const { class: className } = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div :class="cn('flex flex-col space-y-1.5 p-6', className)">
    <slot />
  </div>
</template>
