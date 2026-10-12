<script setup lang="ts">
import { DrawerClose } from 'vaul-vue'

const { asChild } = defineProps<{ asChild?: boolean }>()
</script>

<template>
  <DrawerClose :as-child="asChild">
    <slot />
  </DrawerClose>
</template>
