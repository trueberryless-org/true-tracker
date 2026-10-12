<script setup lang="ts">
const MARGIN = 5
const LABEL_OFFSET = 16

const { axes, series, title } = defineProps<{ axes: string[]; series: RadarSeries[]; title: string }>()

const container = useTemplateRef<HTMLElement>('container')
const { height, width } = useElementSize(container)
const hovered = ref<number | null>(null)
const pointer = ref({ x: 0, y: 0 })

const center = computed(() => ({ cx: width.value / 2, cy: height.value / 2 }))
const radius = computed(() => (Math.min(width.value - MARGIN * 2, height.value - MARGIN * 2) / 2) * 0.69)
const max = computed(() => getNiceTicks(Math.max(0, ...series.flatMap((s) => s.values))).at(-1) ?? 1)
const rings = [0.25, 0.5, 0.75, 1]

const axisPoints = computed(() =>
  axes.map((label, index) => {
    const angle = 90 - (index * 360) / axes.length
    const end = polarToCartesian(center.value.cx, center.value.cy, radius.value, angle)
    const labelPoint = polarToCartesian(center.value.cx, center.value.cy, radius.value + LABEL_OFFSET, angle)
    const cos = Math.cos((angle * Math.PI) / 180)
    const anchor = Math.abs(cos) < 0.01 ? 'middle' : cos > 0 ? 'start' : 'end'
    return { anchor, end, label, labelPoint }
  }),
)

const polygons = computed(() =>
  series.map((s) => ({
    ...s,
    points: getRadarPoints(s.values, max.value, center.value.cx, center.value.cy, radius.value)
      .map(({ x, y }) => `${x},${y}`)
      .join(' '),
  })),
)

const tooltipItems = computed(() => {
  if (hovered.value === null) return []
  const index = hovered.value
  return series.map((s) => ({ color: s.color, name: s.label, value: s.values[index] ?? 0 }))
})

function trackPointer(event: PointerEvent) {
  if (!container.value || axes.length === 0) return
  const rect = container.value.getBoundingClientRect()
  const x = event.clientX - rect.left - center.value.cx
  const y = event.clientY - rect.top - center.value.cy
  const angle = (90 - (Math.atan2(-y, x) * 180) / Math.PI + 360) % 360
  hovered.value = Math.round(angle / (360 / axes.length)) % axes.length
  pointer.value = { x: event.clientX - rect.left + 10, y: event.clientY - rect.top + 10 }
}
</script>

<template>
  <figure ref="container" class="relative m-0 mx-auto flex aspect-square max-h-[400px] justify-center text-xs">
    <svg
      v-if="width > 0"
      :width="width"
      :height="height"
      aria-hidden="true"
      class="overflow-visible"
      @pointermove="trackPointer"
      @pointerleave="hovered = null"
    >
      <g class="stroke-border" fill="none">
        <circle v-for="ring in rings" :key="ring" :cx="center.cx" :cy="center.cy" :r="radius * ring" />
        <line
          v-for="axis in axisPoints"
          :key="axis.label"
          :x1="center.cx"
          :y1="center.cy"
          :x2="axis.end.x"
          :y2="axis.end.y"
        />
      </g>
      <text
        v-for="axis in axisPoints"
        :key="axis.label"
        :x="axis.labelPoint.x"
        :y="axis.labelPoint.y"
        :text-anchor="axis.anchor"
        dominant-baseline="middle"
        class="fill-muted-foreground"
      >
        {{ axis.label }}
      </text>
      <polygon
        v-for="polygon in polygons"
        :key="polygon.key"
        :points="polygon.points"
        :style="{ fill: polygon.color }"
        fill-opacity="0.6"
      />
    </svg>
    <ChartTooltip
      v-if="tooltipItems.length && hovered !== null"
      :items="tooltipItems"
      :label="axes[hovered]"
      indicator="line"
      :x="pointer.x"
      :y="pointer.y"
    />
    <figcaption class="sr-only">
      <table>
        <caption>
          {{
            title
          }}
        </caption>
        <thead>
          <tr>
            <td />
            <th v-for="s in series" :key="s.key" scope="col">{{ s.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(axis, index) in axes" :key="axis">
            <th scope="row">{{ axis }}</th>
            <td v-for="s in series" :key="s.key">{{ s.values[index] ?? 0 }}</td>
          </tr>
        </tbody>
      </table>
    </figcaption>
  </figure>
</template>
