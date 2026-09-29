<script setup lang="ts">
import { DropdownMenuItem, type DropdownMenuItemEmits, type DropdownMenuItemProps, useForwardPropsEmits } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const {
  class: className,
  inset,
  ...props
} = defineProps<DropdownMenuItemProps & { class?: HTMLAttributes['class']; inset?: boolean }>()
const emits = defineEmits<DropdownMenuItemEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DropdownMenuItem
    v-bind="forwarded"
    :class="
      cn(
        'focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        className,
      )
    "
  >
    <slot />
  </DropdownMenuItem>
</template>
