import {
  addDays,
  addMinutes,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

export const CALENDAR_VIEWS = ['month', 'week', 'day', 'schedule'] as const
export const WEEK_STARTS_ON = 1
export const SNAP_MINUTES = 15
export const MINUTES_PER_DAY = 24 * 60

export function getViewRange(view: CalendarView, date: Date): CalendarRange {
  switch (view) {
    case 'month':
      return {
        end: endOfWeek(endOfMonth(date), { weekStartsOn: WEEK_STARTS_ON }),
        start: startOfWeek(startOfMonth(date), { weekStartsOn: WEEK_STARTS_ON }),
      }
    case 'week':
      return {
        end: endOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
        start: startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON }),
      }
    case 'day':
      return { end: endOfDay(date), start: startOfDay(date) }
    case 'schedule':
      return { end: endOfMonth(date), start: startOfMonth(date) }
  }
}

export function getRangeDays({ end, start }: CalendarRange): Date[] {
  return Array.from({ length: differenceInCalendarDays(end, start) + 1 }, (_, index) => addDays(start, index))
}

export function getMonthWeeks(date: Date): Date[][] {
  const days = getRangeDays(getViewRange('month', date))
  return Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7))
}

export function shiftDate(view: CalendarView, date: Date, direction: 1 | -1): Date {
  switch (view) {
    case 'month':
    case 'schedule':
      return addMonths(date, direction)
    case 'week':
      return addWeeks(date, direction)
    case 'day':
      return addDays(date, direction)
  }
}

export function formatViewTitle(view: CalendarView, date: Date): string {
  if (view === 'day') return format(date, 'EEEE, MMMM d, yyyy')
  if (view !== 'week') return format(date, 'MMMM yyyy')

  const { end, start } = getViewRange('week', date)
  if (isSameMonth(start, end)) return `${format(start, 'MMMM d')} – ${format(end, 'd, yyyy')}`
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
}

export function getDaySegments(events: CalendarEvent[], day: Date, now = new Date()): DaySegment[] {
  const dayStart = startOfDay(day).getTime()
  const dayEnd = dayStart + MINUTES_PER_DAY * 60_000

  return events
    .map((event) => {
      const start = event.start.getTime()
      const end = (event.end ?? now).getTime()
      if (end <= dayStart || start >= dayEnd) return null

      const startMinute = Math.max(0, (start - dayStart) / 60_000)
      const endMinute = Math.min(MINUTES_PER_DAY, (end - dayStart) / 60_000)
      return {
        continuesAfter: end > dayEnd,
        continuesBefore: start < dayStart,
        endMinute: Math.max(endMinute, startMinute + 1),
        event,
        startMinute,
      }
    })
    .filter((segment): segment is Omit<DaySegment, 'column' | 'columns'> => segment !== null)
    .sort((a, b) => a.startMinute - b.startMinute || b.endMinute - a.endMinute)
    .reduce<DaySegment[]>(placeInColumns, [])
}

export function getEventsOnDay(events: CalendarEvent[], day: Date, now = new Date()): CalendarEvent[] {
  const dayStart = startOfDay(day).getTime()
  const dayEnd = endOfDay(day).getTime()

  return events
    .filter((event) => event.start.getTime() <= dayEnd && (event.end ?? now).getTime() >= dayStart)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}

export function snapMinutes(minutes: number, step = SNAP_MINUTES): number {
  return Math.round(minutes / step) * step
}

export function moveEvent(event: CalendarEvent, minutes: number, now = new Date()): EventTimes {
  const start = addMinutes(event.start, minutes)
  return { end: event.end ? addMinutes(event.end, minutes) : null, start: event.end ? start : clampToNow(start, now) }
}

export function resizeEvent(event: CalendarEvent, minutes: number): EventTimes {
  if (!event.end) return { end: null, start: event.start }

  const end = addMinutes(event.end, minutes)
  const minimumEnd = addMinutes(event.start, SNAP_MINUTES)
  return { end: end < minimumEnd ? minimumEnd : end, start: event.start }
}

export function minutesToDate(day: Date, minutes: number): Date {
  return addMinutes(startOfDay(day), minutes)
}

export function formatMinutes(minutes: number): string {
  return format(minutesToDate(new Date(2000, 0, 1), minutes), 'h a')
}

export function formatEventTimes(event: CalendarEvent): string {
  return `${format(event.start, 'h:mm a')} – ${event.end ? format(event.end, 'h:mm a') : 'now'}`
}

export function getEventLabel(event: CalendarEvent): string {
  const flow = findOption(flows, event.flow)?.label ?? event.flow
  const archived = event.isReadOnly ? ', archived project' : ''
  return `${event.taskName}, ${event.projectName}, ${format(event.start, 'EEEE, MMMM d')}, ${formatEventTimes(event)}, ${flow} flow${archived}`
}

function clampToNow(start: Date, now: Date) {
  return start > now ? now : start
}

function placeInColumns(placed: DaySegment[], segment: Omit<DaySegment, 'column' | 'columns'>): DaySegment[] {
  const overlapping = placed.filter((other) => other.endMinute > segment.startMinute)
  const usedColumns = new Set(overlapping.map((other) => other.column))
  let column = 0
  while (usedColumns.has(column)) column++

  const next = { ...segment, column, columns: 1 }
  const cluster = [...overlapping, next]
  const columns = Math.max(...cluster.map((item) => item.column)) + 1
  for (const item of cluster) item.columns = Math.max(item.columns, columns)

  return [...placed, next]
}

export type CalendarView = (typeof CALENDAR_VIEWS)[number]

export interface CalendarRange {
  end: Date
  start: Date
}

export interface CalendarEvent {
  color: string
  end: Date | null
  flow: Flow
  id: string
  isReadOnly: boolean
  projectName: string
  taskId: string
  taskName: string
  start: Date
}

export interface EventTimes {
  end: Date | null
  start: Date
}

export interface DaySegment {
  column: number
  columns: number
  continuesAfter: boolean
  continuesBefore: boolean
  endMinute: number
  event: CalendarEvent
  startMinute: number
}
