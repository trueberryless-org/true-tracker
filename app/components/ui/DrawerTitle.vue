<script setup lang="ts">
import { DrawerTitle } from 'vaul-vue'
import type { HTMLAttributes } from 'vue'

const { class: className } = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DrawerTitle :class="cn('text-lg leading-none font-semibold tracking-tight', className)">
    <slot />
  </DrawerTitle>
</template>
