<script setup lang="ts">
import { format, isSameDay, isToday } from 'date-fns'

const HOUR_HEIGHT = 48
const GRID_HEIGHT = HOUR_HEIGHT * 24
const DRAG_THRESHOLD = 4
const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

const { days, events, highlightId, now } = defineProps<{
  days: Date[]
  events: CalendarEvent[]
  highlightId?: string
  now: Date
}>()
const emit = defineEmits<{
  change: [event: CalendarEvent, times: EventTimes]
  create: [start: Date, end: Date]
  open: [event: CalendarEvent]
  selectDay: [day: Date]
}>()

const scroller = useTemplateRef<HTMLElement>('scroller')
const drag = shallowRef<DragState | null>(null)

const previewEvents = computed(() => {
  const state = drag.value
  if (!state || state.type === 'create' || !state.moved) return events
  return events.map((event) => (event.id === state.event.id ? { ...event, ...getDraggedTimes(state) } : event))
})

const columns = computed(() =>
  days.map((day) => ({
    day,
    isToday: isToday(day),
    segments: getDaySegments(previewEvents.value, day, now),
  })),
)

const createPreview = computed(() => {
  const state = drag.value
  if (state?.type !== 'create' || !state.moved) return null
  const start = Math.min(state.startMinute, state.currentMinute)
  const end = Math.max(state.startMinute, state.currentMinute, start + SNAP_MINUTES)
  return { dayIndex: state.dayIndex, end, start }
})

const nowMinute = computed(() => now.getHours() * 60 + now.getMinutes())

onMounted(() => {
  const focus = highlightId ? events.find((event) => event.id === highlightId) : undefined
  const minute = focus && days.some((day) => isSameDay(day, focus.start)) ? focus.start.getHours() * 60 : 7 * 60
  scroller.value?.scrollTo({ top: (minute / 60) * HOUR_HEIGHT - HOUR_HEIGHT / 2 })
})

function getMinuteFromPointer(event: PointerEvent, column: HTMLElement) {
  const rect = column.getBoundingClientRect()
  const minute = ((event.clientY - rect.top) / GRID_HEIGHT) * MINUTES_PER_DAY
  return Math.min(MINUTES_PER_DAY, Math.max(0, snapMinutes(minute)))
}

function getDayIndexFromPointer(event: PointerEvent) {
  const element = document
    .elementsFromPoint(event.clientX, event.clientY)
    .find((candidate) => candidate instanceof HTMLElement && candidate.dataset.dayIndex !== undefined)
  return element instanceof HTMLElement ? Number(element.dataset.dayIndex) : null
}

function startCreate(event: PointerEvent, dayIndex: number) {
  if (event.button !== 0 || event.target !== event.currentTarget) return
  const column = event.currentTarget as HTMLElement
  const minute = getMinuteFromPointer(event, column)
  if (event.pointerType !== 'touch') column.setPointerCapture(event.pointerId)
  drag.value = {
    column,
    currentMinute: minute,
    dayIndex,
    moved: false,
    originY: event.clientY,
    startMinute: minute,
    type: 'create',
  }
}

function startMove(event: PointerEvent, calendarEvent: CalendarEvent, dayIndex: number, type: 'move' | 'resize') {
  if (event.button !== 0) return
  event.stopPropagation()
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  drag.value = {
    dayDelta: 0,
    dayIndex,
    event: calendarEvent,
    minuteDelta: 0,
    moved: false,
    originX: event.clientX,
    originY: event.clientY,
    type,
  }
}

function updateDrag(event: PointerEvent) {
  const state = drag.value
  if (!state) return

  const moved = state.moved || Math.abs(event.clientY - state.originY) > DRAG_THRESHOLD
  if (state.type === 'create') {
    drag.value = { ...state, currentMinute: getMinuteFromPointer(event, state.column), moved }
    return
  }

  if (state.event.isReadOnly) return

  const dayIndex = state.type === 'move' ? getDayIndexFromPointer(event) : null
  drag.value = {
    ...state,
    dayDelta: dayIndex === null ? state.dayDelta : dayIndex - state.dayIndex,
    minuteDelta: snapMinutes(((event.clientY - state.originY) / HOUR_HEIGHT) * 60),
    moved: moved || Math.abs(event.clientX - state.originX) > DRAG_THRESHOLD,
  }
}

function finishDrag() {
  const state = drag.value
  drag.value = null
  if (!state) return

  if (state.type === 'create') {
    const day = days[state.dayIndex]
    if (!day) return
    const start = state.moved ? Math.min(state.startMinute, state.currentMinute) : state.startMinute
    const end = state.moved
      ? Math.max(state.startMinute, state.currentMinute, start + SNAP_MINUTES)
      : Math.min(start + 60, MINUTES_PER_DAY)
    emit('create', minutesToDate(day, start), minutesToDate(day, end))
    return
  }

  if (!state.moved) {
    emit('open', state.event)
    return
  }
  emit('change', state.event, getDraggedTimes(state))
}

function getDraggedTimes(state: MoveState): EventTimes {
  if (state.type === 'resize') return resizeEvent(state.event, state.minuteDelta)
  return moveEvent(state.event, state.minuteDelta + state.dayDelta * MINUTES_PER_DAY, now)
}

function handleEventKeydown(event: KeyboardEvent, calendarEvent: CalendarEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('open', calendarEvent)
    return
  }
  if (!event.altKey || calendarEvent.isReadOnly) return

  const step = event.key === 'ArrowUp' ? -SNAP_MINUTES : event.key === 'ArrowDown' ? SNAP_MINUTES : 0
  const dayStep = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
  if (!step && !dayStep) return

  event.preventDefault()
  if (event.shiftKey && step) emit('change', calendarEvent, resizeEvent(calendarEvent, step))
  else emit('change', calendarEvent, moveEvent(calendarEvent, step + dayStep * MINUTES_PER_DAY, now))
}

function getSegmentStyle(segment: DaySegment) {
  return {
    height: `${((segment.endMinute - segment.startMinute) / MINUTES_PER_DAY) * GRID_HEIGHT}px`,
    left: `calc(${(segment.column / segment.columns) * 100}% + 2px)`,
    top: `${(segment.startMinute / MINUTES_PER_DAY) * GRID_HEIGHT}px`,
    width: `calc(${100 / segment.columns}% - 4px)`,
  }
}

type DragState = CreateState | MoveState

interface CreateState {
  column: HTMLElement
  currentMinute: number
  dayIndex: number
  moved: boolean
  originY: number
  startMinute: number
  type: 'create'
}

interface MoveState {
  dayDelta: number
  dayIndex: number
  event: CalendarEvent
  minuteDelta: number
  moved: boolean
  originX: number
  originY: number
  type: 'move' | 'resize'
}
</script>

<template>
  <div class="overflow-hidden rounded-md border">
    <div
      class="bg-muted/40 grid border-b"
      :style="{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))` }"
    >
      <div aria-hidden="true" />
      <button
        v-for="column in columns"
        :key="column.day.toISOString()"
        type="button"
        class="hover:bg-accent focus-visible:ring-ring flex flex-col items-center border-l py-2 text-sm outline-hidden focus-visible:ring-2 focus-visible:ring-inset"
        :aria-label="`Show ${format(column.day, 'EEEE, MMMM d')} in day view`"
        @click="emit('selectDay', column.day)"
      >
        <span class="text-muted-foreground text-xs uppercase">{{ format(column.day, 'EEE') }}</span>
        <span
          :class="
            cn(
              'mt-0.5 flex h-7 w-7 items-center justify-center rounded-full font-semibold',
              column.isToday && 'bg-primary text-primary-foreground',
            )
          "
        >
          {{ format(column.day, 'd') }}
        </span>
      </button>
    </div>
    <div
      ref="scroller"
      tabindex="0"
      role="region"
      aria-label="Time grid, scroll to see other hours"
      class="focus-visible:ring-ring max-h-[36rem] overflow-y-auto overscroll-contain outline-hidden focus-visible:ring-2 focus-visible:ring-inset"
    >
      <div
        class="relative grid"
        :style="{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))`, height: `${GRID_HEIGHT}px` }"
      >
        <div class="relative" aria-hidden="true">
          <span
            v-for="hour in HOURS.slice(1)"
            :key="hour"
            class="text-muted-foreground absolute right-2 -translate-y-1/2 text-xs"
            :style="{ top: `${hour * HOUR_HEIGHT}px` }"
          >
            {{ formatMinutes(hour * 60) }}
          </span>
        </div>
        <div
          v-for="(column, dayIndex) in columns"
          :key="column.day.toISOString()"
          :data-day-index="dayIndex"
          class="relative cursor-cell touch-pan-y border-l bg-[linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-size-[100%_48px]"
          @pointerdown="startCreate($event, dayIndex)"
          @pointermove="updateDrag"
          @pointerup="finishDrag"
          @pointercancel="drag = null"
        >
          <div
            v-if="createPreview && createPreview.dayIndex === dayIndex"
            class="border-primary bg-primary/15 pointer-events-none absolute inset-x-1 rounded-md border-2 border-dashed"
            :style="{
              height: `${((createPreview.end - createPreview.start) / MINUTES_PER_DAY) * GRID_HEIGHT}px`,
              top: `${(createPreview.start / MINUTES_PER_DAY) * GRID_HEIGHT}px`,
            }"
            aria-hidden="true"
          />
          <div
            v-for="segment in column.segments"
            :key="segment.event.id"
            role="button"
            :tabindex="0"
            :aria-label="getEventLabel(segment.event)"
            :aria-describedby="segment.event.isReadOnly ? undefined : 'calendar-shortcuts'"
            :class="
              cn(
                'focus-visible:ring-ring absolute overflow-hidden rounded-md border-l-4 px-2 py-1 text-left text-xs shadow-xs outline-hidden select-none focus-visible:z-20 focus-visible:ring-2',
                segment.event.isReadOnly
                  ? 'cursor-pointer border-dashed'
                  : 'cursor-grab touch-none active:cursor-grabbing',
                segment.event.id === highlightId && 'ring-primary ring-2',
                drag?.type !== 'create' &&
                  drag?.moved &&
                  drag.event.id === segment.event.id &&
                  'z-30 opacity-80 shadow-lg',
              )
            "
            :style="{
              ...getSegmentStyle(segment),
              background: `color-mix(in oklab, ${segment.event.color} 18%, hsl(var(--background)))`,
              borderLeftColor: segment.event.color,
            }"
            @pointerdown="startMove($event, segment.event, dayIndex, 'move')"
            @pointermove="updateDrag"
            @pointerup="finishDrag"
            @pointercancel="drag = null"
            @keydown="handleEventKeydown($event, segment.event)"
          >
            <p class="truncate font-medium">{{ segment.event.taskName }}</p>
            <p class="truncate">{{ segment.event.projectName }}</p>
            <p class="truncate">{{ formatEventTimes(segment.event) }}</p>
            <div
              v-if="!segment.event.isReadOnly && segment.event.end && !segment.continuesAfter"
              class="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
              aria-hidden="true"
              @pointerdown="startMove($event, segment.event, dayIndex, 'resize')"
            />
          </div>
          <div
            v-if="column.isToday"
            class="bg-destructive pointer-events-none absolute inset-x-0 z-10 h-0.5"
            :style="{ top: `${(nowMinute / MINUTES_PER_DAY) * GRID_HEIGHT}px` }"
            aria-hidden="true"
          >
            <span class="bg-destructive absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
