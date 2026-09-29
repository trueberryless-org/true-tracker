<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const { as = 'h3', class: className } = defineProps<{ as?: string; class?: HTMLAttributes['class'] }>()
</script>

<template>
  <component :is="as" :class="cn('text-2xl leading-none font-semibold tracking-tight', className)">
    <slot />
  </component>
</template>
