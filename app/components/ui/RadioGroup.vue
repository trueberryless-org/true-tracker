<script setup lang="ts">
import { RadioGroupRoot, type RadioGroupRootEmits, type RadioGroupRootProps, useForwardPropsEmits } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const { class: className, ...props } = defineProps<RadioGroupRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<RadioGroupRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <RadioGroupRoot v-bind="forwarded" :class="cn('grid gap-2', className)">
    <slot />
  </RadioGroupRoot>
</template>
