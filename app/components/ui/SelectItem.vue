<script setup lang="ts">
import { Check } from '@lucide/vue'
import { SelectItem, SelectItemIndicator, type SelectItemProps, SelectItemText } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const { class: className, ...props } = defineProps<SelectItemProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <SelectItem
    v-bind="props"
    :class="
      cn(
        'focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )
    "
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectItemIndicator>
        <Check class="h-4 w-4" aria-hidden="true" />
      </SelectItemIndicator>
    </span>
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
