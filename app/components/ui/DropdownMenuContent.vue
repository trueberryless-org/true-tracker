<script setup lang="ts">
import {
  DropdownMenuContent,
  type DropdownMenuContentEmits,
  type DropdownMenuContentProps,
  DropdownMenuPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const {
  class: className,
  sideOffset = 4,
  ...props
} = defineProps<DropdownMenuContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<DropdownMenuContentEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      v-bind="forwarded"
      :side-offset="sideOffset"
      :class="
        cn(
          'bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md',
          POPOVER_ANIMATION,
          className,
        )
      "
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
