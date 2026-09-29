<script setup lang="ts">
import { TabsList, type TabsListProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const { class: className, ...props } = defineProps<TabsListProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <TabsList
    v-bind="props"
    :class="cn('bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1', className)"
  >
    <slot />
  </TabsList>
</template>
