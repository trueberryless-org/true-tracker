<script setup lang="ts">
import { DrawerContent, DrawerOverlay, DrawerPortal } from 'vaul-vue'
import type { HTMLAttributes } from 'vue'

const { class: className } = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay class="fixed inset-0 z-50 bg-black/80" />
    <DrawerContent
      :class="
        cn('bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border', className)
      "
    >
      <div class="bg-muted mx-auto mt-4 h-2 w-[100px] rounded-full" aria-hidden="true" />
      <slot />
    </DrawerContent>
  </DrawerPortal>
</template>
