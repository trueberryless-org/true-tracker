<script setup lang="ts">
import {
  PopoverContent,
  type PopoverContentEmits,
  type PopoverContentProps,
  PopoverPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const {
  align = 'center',
  class: className,
  sideOffset = 4,
  ...props
} = defineProps<PopoverContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<PopoverContentEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      v-bind="forwarded"
      :align="align"
      :side-offset="sideOffset"
      :class="
        cn(
          'bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-hidden',
          POPOVER_ANIMATION,
          className,
        )
      "
    >
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
