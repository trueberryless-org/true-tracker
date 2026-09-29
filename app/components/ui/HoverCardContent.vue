<script setup lang="ts">
import { HoverCardContent, type HoverCardContentProps, HoverCardPortal } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const {
  align = 'center',
  class: className,
  sideOffset = 4,
  ...props
} = defineProps<HoverCardContentProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <HoverCardPortal>
    <HoverCardContent
      v-bind="props"
      :align="align"
      :side-offset="sideOffset"
      :class="
        cn(
          'bg-popover text-popover-foreground z-50 w-64 rounded-md border p-4 shadow-md outline-hidden',
          POPOVER_ANIMATION,
          className,
        )
      "
    >
      <slot />
    </HoverCardContent>
  </HoverCardPortal>
</template>
