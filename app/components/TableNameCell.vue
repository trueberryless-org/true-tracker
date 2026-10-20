<script setup lang="ts">
const {
  archived = false,
  name,
  running = false,
} = defineProps<{
  archived?: boolean
  name: string
  running?: boolean
}>()

const breakpoint = useTableBreakpoint()
const showBadges = computed(() => breakpoint.value === 'md' || breakpoint.value === 'lg' || breakpoint.value === 'xl')
</script>

<template>
  <div class="flex space-x-2">
    <template v-if="showBadges">
      <Badge v-if="archived" variant="destructive">Archived</Badge>
      <Badge v-if="running" variant="default">Running</Badge>
    </template>
    <span class="max-w-[500px] truncate font-medium">{{ name }}</span>
  </div>
</template>
