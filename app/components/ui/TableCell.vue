<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const { class: className } = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <td :class="cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)">
    <slot />
  </td>
</template>
