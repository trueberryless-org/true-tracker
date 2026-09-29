<script setup lang="ts">
const { color, title } = defineProps<{ color: Theme | 'current'; title: string }>()

const colors = computed(() =>
  [1, 3, 2, 4].map((index) => (color === 'current' ? `var(--color-${index})` : `var(--color-${index}-${color})`)),
)
</script>

<template>
  <div class="h-6 w-6 overflow-hidden rounded-sm">
    <div
      :class="
        cn(
          'grid h-12 w-12 -translate-x-1/4 -translate-y-1/4 grid-cols-2 overflow-hidden rounded-md transition-all ease-in-out',
          color === 'current' ? 'rotate-45' : 'rotate-0 group-hover:rotate-45 group-focus:rotate-45',
        )
      "
      aria-hidden="true"
    >
      <div v-for="(background, index) in colors" :key="index" class="flex h-6 w-6" :style="{ background }" />
    </div>
    <span class="sr-only">{{ title }}</span>
  </div>
</template>
