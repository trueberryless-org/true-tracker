<script setup lang="ts">
import { DrawerTrigger } from 'vaul-vue'

const { asChild } = defineProps<{ asChild?: boolean }>()
</script>

<template>
  <DrawerTrigger :as-child="asChild">
    <slot />
  </DrawerTrigger>
</template>
