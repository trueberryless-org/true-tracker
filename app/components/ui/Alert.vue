<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

const { class: className, variant } = defineProps<AlertVariants & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div :role="variant === 'destructive' ? 'alert' : 'status'" :class="cn(alertVariants({ variant }), className)">
    <slot />
  </div>
</template>
