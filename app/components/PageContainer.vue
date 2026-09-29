<script setup lang="ts">
const { class: className } = defineProps<{ class?: string }>()
</script>

<template>
  <div class="flex w-full flex-col">
    <div :class="cn('bg-muted/40 flex min-h-[calc(100vh-4rem)] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10', className)">
      <slot />
    </div>
  </div>
</template>
