<script setup lang="ts">
import { differenceInCalendarDays, format, isSameMonth, isToday } from 'date-fns'

const MAX_VISIBLE = 3
const DRAG_THRESHOLD = 4

const { date, events, highlightId, now } = defineProps<{
  date: Date
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

const drag = shallowRef<DragState | null>(null)
const weeks = computed(() => getMonthWeeks(date))
const weekdays = computed(() => weeks.value[0]?.map((day) => format(day, 'EEE')) ?? [])

function getCellEvents(day: Date) {
  return getEventsOnDay(events, day, now)
}

function createOnDay(event: PointerEvent, day: Date) {
  if (event.button !== 0 || event.target !== event.currentTarget) return
  emit('create', minutesToDate(day, 9 * 60), minutesToDate(day, 10 * 60))
}

function startDrag(event: PointerEvent, calendarEvent: CalendarEvent, day: Date) {
  if (event.button !== 0) return
  event.stopPropagation()
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  drag.value = {
    day,
    event: calendarEvent,
    moved: false,
    originX: event.clientX,
    originY: event.clientY,
    targetDay: day,
  }
}

function updateDrag(event: PointerEvent) {
  const state = drag.value
  if (!state || state.event.isReadOnly) return

  const moved =
    state.moved ||
    Math.abs(event.clientX - state.originX) > DRAG_THRESHOLD ||
    Math.abs(event.clientY - state.originY) > DRAG_THRESHOLD
  const cell = document
    .elementsFromPoint(event.clientX, event.clientY)
    .find((element) => element instanceof HTMLElement && element.dataset.date)
  const targetDay = cell instanceof HTMLElement && cell.dataset.date ? new Date(cell.dataset.date) : state.targetDay
  drag.value = { ...state, moved, targetDay }
}

function finishDrag() {
  const state = drag.value
  drag.value = null
  if (!state) return

  if (!state.moved) {
    emit('open', state.event)
    return
  }

  const days = differenceInCalendarDays(state.targetDay, state.day)
  if (days !== 0) emit('change', state.event, moveEvent(state.event, days * MINUTES_PER_DAY, now))
}

function handleKeydown(event: KeyboardEvent, calendarEvent: CalendarEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('open', calendarEvent)
    return
  }
  if (!event.altKey || calendarEvent.isReadOnly) return

  const days = { ArrowDown: 7, ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7 }[event.key]
  if (!days) return
  event.preventDefault()
  emit('change', calendarEvent, moveEvent(calendarEvent, days * MINUTES_PER_DAY, now))
}

interface DragState {
  day: Date
  event: CalendarEvent
  moved: boolean
  originX: number
  originY: number
  targetDay: Date
}
</script>

<template>
  <div class="overflow-hidden rounded-md border">
    <div class="bg-muted/40 grid grid-cols-7 border-b" aria-hidden="true">
      <div v-for="weekday in weekdays" :key="weekday" class="text-muted-foreground py-2 text-center text-xs uppercase">
        {{ weekday }}
      </div>
    </div>
    <div class="grid grid-cols-7">
      <template v-for="week in weeks" :key="week[0]?.toISOString()">
        <div
          v-for="day in week"
          :key="day.toISOString()"
          :data-date="day.toISOString()"
          :class="
            cn(
              'relative min-h-24 cursor-cell border-t border-l p-1 first:border-l-0 sm:min-h-28 [&:nth-child(7n+1)]:border-l-0',
              !isSameMonth(day, date) && 'bg-muted/40',
              drag?.moved && drag.targetDay.toDateString() === day.toDateString() && 'bg-accent',
            )
          "
          @pointerup="createOnDay($event, day)"
        >
          <button
            type="button"
            :class="
              cn(
                'hover:bg-accent focus-visible:ring-ring mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs outline-hidden focus-visible:ring-2',
                isToday(day) && 'bg-primary text-primary-foreground hover:bg-primary/90',
                !isSameMonth(day, date) && !isToday(day) && 'text-muted-foreground',
              )
            "
            :aria-label="`Show ${format(day, 'EEEE, MMMM d')} in day view`"
            @click="emit('selectDay', day)"
          >
            {{ format(day, 'd') }}
          </button>
          <ul class="space-y-0.5">
            <li v-for="calendarEvent in getCellEvents(day).slice(0, MAX_VISIBLE)" :key="calendarEvent.id">
              <div
                role="button"
                tabindex="0"
                :aria-label="getEventLabel(calendarEvent)"
                :aria-describedby="calendarEvent.isReadOnly ? undefined : 'calendar-shortcuts'"
                :class="
                  cn(
                    'focus-visible:ring-ring flex min-h-6 items-center gap-1 truncate rounded-sm border-l-4 px-1 py-0.5 text-xs outline-hidden select-none focus-visible:ring-2',
                    calendarEvent.isReadOnly ? 'cursor-pointer opacity-70' : 'cursor-grab touch-none',
                    calendarEvent.id === highlightId && 'ring-primary ring-2',
                  )
                "
                :style="{
                  background: `color-mix(in oklab, ${calendarEvent.color} 18%, hsl(var(--background)))`,
                  borderLeftColor: calendarEvent.color,
                }"
                @pointerdown="startDrag($event, calendarEvent, day)"
                @pointermove="updateDrag"
                @pointerup.stop="finishDrag"
                @pointercancel="drag = null"
                @keydown="handleKeydown($event, calendarEvent)"
              >
                <span class="text-muted-foreground hidden shrink-0 sm:inline">{{
                  format(calendarEvent.start, 'h:mmaaaaa')
                }}</span>
                <span class="truncate font-medium">{{ calendarEvent.taskName }}</span>
              </div>
            </li>
          </ul>
          <button
            v-if="getCellEvents(day).length > MAX_VISIBLE"
            type="button"
            class="text-muted-foreground hover:text-foreground focus-visible:ring-ring mt-0.5 min-h-6 rounded-sm px-1 text-xs outline-hidden focus-visible:ring-2"
            @click="emit('selectDay', day)"
          >
            +{{ getCellEvents(day).length - MAX_VISIBLE }} more
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
