<script setup lang="ts">
import { useForwardPropsEmits } from 'reka-ui'
import { DrawerRoot, type DrawerRootEmits, type DrawerRootProps } from 'vaul-vue'

const { shouldScaleBackground = true, ...props } = defineProps<DrawerRootProps>()
const emits = defineEmits<DrawerRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DrawerRoot v-bind="forwarded" :should-scale-background="shouldScaleBackground">
    <slot />
  </DrawerRoot>
</template>
