<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const {
  as = 'button',
  asChild,
  class: className,
  size,
  variant,
} = defineProps<PrimitiveProps & ButtonVariants & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :type="as === 'button' && !asChild ? 'button' : undefined"
    :class="cn(buttonVariants({ size, variant }), className)"
  >
    <slot />
  </Primitive>
</template>
