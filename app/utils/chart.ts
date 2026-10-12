const NICE_STEPS = [1, 2, 2.5, 5, 10]

export function getNiceTicks(max: number, count = 5): number[] {
  if (max <= 0) return Array.from({ length: count }, (_, index) => index)

  const roughStep = max / (count - 1)
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const step = (NICE_STEPS.find((candidate) => candidate * magnitude >= roughStep) ?? 10) * magnitude

  return Array.from({ length: count }, (_, index) => Number((index * step).toPrecision(12)))
}

export function getRoundedTopBarPath(x: number, y: number, width: number, height: number, radius: number): string {
  if (height <= 0 || width <= 0) return ''

  const r = Math.min(radius, width / 2, height / 2)
  return [
    `M ${x},${y + r}`,
    `A ${r},${r} 0 0 1 ${x + r},${y}`,
    `L ${x + width - r},${y}`,
    `A ${r},${r} 0 0 1 ${x + width},${y + r}`,
    `L ${x + width},${y + height - r}`,
    `A ${r},${r} 0 0 1 ${x + width - r},${y + height}`,
    `L ${x + r},${y + height}`,
    `A ${r},${r} 0 0 1 ${x},${y + height - r}`,
    'Z',
  ].join(' ')
}

export function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number): Point {
  const radians = (-angleInDegrees * Math.PI) / 180
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) }
}

export function getDonutSectorPath(sector: DonutSector): string {
  const { cx, cy, endAngle, innerRadius, outerRadius, startAngle } = sector
  const sweep = startAngle - endAngle

  if (sweep >= 359.999) {
    const mid = startAngle - 180
    return [getDonutSectorPath({ ...sector, endAngle: mid }), getDonutSectorPath({ ...sector, startAngle: mid })].join(
      ' ',
    )
  }

  const largeArc = sweep > 180 ? 1 : 0
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle)
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle)
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle)
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle)

  return [
    `M ${outerStart.x},${outerStart.y}`,
    `A ${outerRadius},${outerRadius} 0 ${largeArc} 1 ${outerEnd.x},${outerEnd.y}`,
    `L ${innerEnd.x},${innerEnd.y}`,
    `A ${innerRadius},${innerRadius} 0 ${largeArc} 0 ${innerStart.x},${innerStart.y}`,
    'Z',
  ].join(' ')
}

export function getDonutSectors(values: number[], geometry: DonutGeometry): DonutSector[] {
  const total = values.reduce((sum, value) => sum + value, 0)
  if (total <= 0) return []

  const sectors: DonutSector[] = []
  let angle = 90

  for (const value of values) {
    const sweep = (value / total) * 360
    sectors.push({ ...geometry, endAngle: angle - sweep, startAngle: angle })
    angle -= sweep
  }

  return sectors
}

export function getRadarPoints(values: number[], max: number, cx: number, cy: number, radius: number): Point[] {
  return values.map((value, index) =>
    polarToCartesian(cx, cy, max > 0 ? (value / max) * radius : 0, 90 - (index * 360) / values.length),
  )
}

export interface Point {
  x: number
  y: number
}

export interface DonutGeometry {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
}

export interface DonutSector extends DonutGeometry {
  endAngle: number
  startAngle: number
}

export interface BarDatum {
  label: string
  shortLabel?: string
  value: number
}

export interface ChartTooltipItem {
  color: string
  name: string
  value: number
}

export interface ChartSlice {
  color: string
  label: string
  value: number
}

export interface RadarSeries {
  color: string
  key: string
  label: string
  values: number[]
}
