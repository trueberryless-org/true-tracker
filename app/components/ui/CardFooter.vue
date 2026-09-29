<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const { class: className } = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div :class="cn('flex items-center p-6 pt-0', className)">
    <slot />
  </div>
</template>
