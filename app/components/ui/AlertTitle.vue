<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const { class: className } = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <h5 :class="cn('mb-1 leading-none font-medium tracking-tight', className)">
    <slot />
  </h5>
</template>
