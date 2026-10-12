<script setup lang="ts">
const MARGIN = 5

const { centerLabel, centerValue, data, title } = defineProps<{
  centerLabel: string
  centerValue: string
  data: ChartSlice[]
  title: string
}>()

const container = useTemplateRef<HTMLElement>('container')
const { height, width } = useElementSize(container)
const hovered = ref<number | null>(null)
const pointer = ref({ x: 0, y: 0 })

const geometry = computed(() => {
  const maxRadius = Math.min(width.value - MARGIN * 2, height.value - MARGIN * 2) / 2
  return { cx: width.value / 2, cy: height.value / 2, innerRadius: maxRadius * 0.6, outerRadius: maxRadius * 0.8 }
})

const sectors = computed(() =>
  getDonutSectors(
    data.map((slice) => slice.value),
    geometry.value,
  )
    .map((sector, index) => ({ index, path: getDonutSectorPath(sector), slice: data[index] }))
    .filter((sector) => sector.slice && sector.slice.value > 0),
)

const tooltipItems = computed(() => {
  const slice = hovered.value === null ? undefined : data[hovered.value]
  return slice ? [{ color: slice.color, name: slice.label, value: slice.value }] : []
})

function trackPointer(event: PointerEvent, index: number) {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  hovered.value = index
  pointer.value = { x: event.clientX - rect.left + 10, y: event.clientY - rect.top + 10 }
}
</script>

<template>
  <figure ref="container" class="relative m-0 mx-auto flex aspect-square max-h-[400px] justify-center text-xs">
    <svg v-if="width > 0" :width="width" :height="height" aria-hidden="true" @pointerleave="hovered = null">
      <path
        v-for="sector in sectors"
        :key="sector.index"
        :d="sector.path"
        :style="{ fill: sector.slice?.color }"
        @pointermove="trackPointer($event, sector.index)"
      />
      <text :x="geometry.cx" :y="geometry.cy" text-anchor="middle" dominant-baseline="middle">
        <tspan :x="geometry.cx" :y="geometry.cy" class="fill-foreground text-3xl font-bold">{{ centerValue }}</tspan>
        <tspan :x="geometry.cx" :y="geometry.cy + 24" class="fill-muted-foreground">{{ centerLabel }}</tspan>
      </text>
    </svg>
    <ChartTooltip v-if="tooltipItems.length" :items="tooltipItems" :x="pointer.x" :y="pointer.y" />
    <figcaption class="sr-only">
      <table>
        <caption>
          {{
            title
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">{{ centerLabel }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slice in data" :key="slice.label">
            <th scope="row">{{ slice.label }}</th>
            <td>{{ slice.value }}</td>
          </tr>
        </tbody>
      </table>
    </figcaption>
  </figure>
</template>
