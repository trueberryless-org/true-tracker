<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const { class: className, variant } = defineProps<BadgeVariants & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div :class="cn(badgeVariants({ variant }), className)">
    <slot />
  </div>
</template>
