<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const { class: className } = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <tbody :class="cn('[&_tr:last-child]:border-0', className)">
    <slot />
  </tbody>
</template>
