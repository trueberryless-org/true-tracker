<script setup lang="ts">
const {
  indicator = 'dot',
  items,
  label,
  x,
  y,
} = defineProps<{
  indicator?: 'dot' | 'line'
  items: ChartTooltipItem[]
  label?: string
  x: number
  y: number
}>()

const nestLabel = computed(() => items.length === 1 && indicator !== 'dot')
</script>

<template>
  <div
    class="border-border/50 bg-background pointer-events-none absolute top-0 left-0 z-10 grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl transition-transform duration-150 ease-out"
    :style="{ transform: `translate(${x}px, ${y}px)` }"
    aria-hidden="true"
  >
    <div v-if="label && !nestLabel" class="font-medium">{{ label }}</div>
    <div class="grid gap-1.5">
      <div
        v-for="item in items"
        :key="item.name"
        :class="cn('flex w-full items-stretch gap-2', indicator === 'dot' && 'items-center')"
      >
        <div
          :class="cn('shrink-0 rounded-[2px]', indicator === 'dot' ? 'h-2.5 w-2.5' : 'w-1')"
          :style="{ background: item.color, borderColor: item.color }"
        />
        <div :class="cn('flex flex-1 justify-between leading-none', nestLabel ? 'items-end' : 'items-center')">
          <div class="grid gap-1.5">
            <div v-if="label && nestLabel" class="font-medium">{{ label }}</div>
            <span class="text-muted-foreground">{{ item.name }}</span>
          </div>
          <span v-if="item.value" class="text-foreground font-mono font-medium tabular-nums">
            {{ item.value.toLocaleString() }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
