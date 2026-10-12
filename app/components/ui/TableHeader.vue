<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const { class: className } = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <thead :class="cn('[&_tr]:border-b', className)">
    <slot />
  </thead>
</template>
