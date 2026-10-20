<script setup lang="ts">
import { DrawerDescription } from 'vaul-vue'
import type { HTMLAttributes } from 'vue'

const { class: className } = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DrawerDescription :class="cn('text-muted-foreground text-sm', className)">
    <slot />
  </DrawerDescription>
</template>
