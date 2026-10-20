<script setup lang="ts">
const MARGIN = 5
const AXIS_HEIGHT = 30
const TICK_OFFSET = 16

const {
  aspect = 16 / 9,
  color,
  data,
  fixedHeight,
  labelThreshold,
  radius = 8,
  seriesLabel,
  showAxis = true,
  showGrid = true,
  showTooltip = true,
  showValueLabels = true,
  title,
} = defineProps<{
  aspect?: number
  color: string
  data: BarDatum[]
  fixedHeight?: number
  labelThreshold?: number
  radius?: number
  seriesLabel: string
  showAxis?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  showValueLabels?: boolean
  title: string
}>()

const container = useTemplateRef<HTMLElement>('container')
const { width } = useElementSize(container)
const height = computed(() => fixedHeight ?? width.value / aspect)
const hovered = ref<number | null>(null)
const pointer = ref({ x: 0, y: 0 })

const ticks = computed(() => getNiceTicks(Math.max(0, ...data.map((d) => d.value))))
const plot = computed(() => {
  const bottom = height.value - MARGIN - (showAxis ? AXIS_HEIGHT : 0)
  return { bottom, height: bottom - MARGIN, left: MARGIN, top: MARGIN, width: width.value - MARGIN * 2 }
})
const yMax = computed(() => ticks.value.at(-1) || 1)
const band = computed(() => (data.length ? plot.value.width / data.length : 0))

const bars = computed(() =>
  data.map((datum, index) => {
    const barHeight = (datum.value / yMax.value) * plot.value.height
    const barWidth = band.value * 0.8
    const x = plot.value.left + index * band.value + band.value * 0.1
    const y = plot.value.bottom - barHeight
    return { ...datum, centerX: x + barWidth / 2, path: getRoundedTopBarPath(x, y, barWidth, barHeight, radius), y }
  }),
)

const tooltipItems = computed(() => {
  if (hovered.value === null) return []
  const datum = data[hovered.value]
  return datum ? [{ color, name: seriesLabel, value: datum.value }] : []
})

function trackPointer(event: PointerEvent) {
  if (!container.value || band.value === 0) return
  const rect = container.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const index = Math.floor((x - plot.value.left) / band.value)
  hovered.value = index >= 0 && index < data.length ? index : null
  pointer.value = { x: Math.min(x + 10, rect.width - 140), y: event.clientY - rect.top + 10 }
}
</script>

<template>
  <figure
    ref="container"
    :class="cn('relative m-0 flex w-full justify-center text-xs')"
    :style="fixedHeight ? { height: `${fixedHeight}px` } : { aspectRatio: aspect }"
  >
    <svg
      v-if="width > 0"
      :width="width"
      :height="height"
      aria-hidden="true"
      class="overflow-visible"
      @pointermove="showTooltip && trackPointer($event)"
      @pointerleave="hovered = null"
    >
      <g v-if="showGrid">
        <line
          v-for="tick in ticks"
          :key="tick"
          :x1="plot.left"
          :x2="plot.left + plot.width"
          :y1="plot.bottom - (tick / yMax) * plot.height"
          :y2="plot.bottom - (tick / yMax) * plot.height"
          class="stroke-border/50"
          stroke-dasharray="0"
        />
      </g>
      <g v-for="bar in bars" :key="bar.label">
        <path :d="bar.path" :style="{ fill: color }" class="motion-safe:transition-[d]" />
        <text
          v-if="showValueLabels && labelThreshold !== undefined && bar.value > labelThreshold"
          :x="bar.centerX"
          :y="bar.y + 20"
          text-anchor="middle"
          dominant-baseline="hanging"
          class="fill-primary-foreground max-md:hidden"
          font-size="12"
          font-weight="700"
        >
          {{ bar.value }}
        </text>
        <text
          v-if="showAxis"
          :x="bar.centerX"
          :y="plot.bottom + TICK_OFFSET"
          text-anchor="middle"
          dominant-baseline="hanging"
          class="fill-muted-foreground"
        >
          {{ bar.shortLabel ?? bar.label }}
        </text>
      </g>
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
            <th scope="col">Label</th>
            <th scope="col">{{ seriesLabel }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="datum in data" :key="datum.label">
            <th scope="row">{{ datum.label }}</th>
            <td>{{ datum.value }}</td>
          </tr>
        </tbody>
      </table>
    </figcaption>
  </figure>
</template>
