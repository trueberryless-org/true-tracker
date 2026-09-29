import { format, isToday } from 'date-fns'

const RELATIVE_INTERVALS = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['day', 86_400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
] as const

export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !Number.isNaN(date.getTime())
}

export function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value == null) return null
  const date = value instanceof Date ? value : new Date(value)
  return isValidDate(date) ? date : null
}

export function formatDateToDistanceFromNow(date: Date, now = Date.now()): string {
  if (!isValidDate(date)) return 'Invalid Date'

  const seconds = Math.floor((now - date.getTime()) / 1000)
  for (const [unit, secondsPerUnit] of RELATIVE_INTERVALS) {
    const interval = Math.floor(seconds / secondsPerUnit)
    if (interval >= 1) return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`
  }

  return 'Just now'
}

export function formatDateTime(date: Date): string {
  if (!isValidDate(date)) return 'Invalid Date'

  if (isToday(date)) return date.toLocaleTimeString([], { hour: 'numeric', hour12: true, minute: '2-digit' })
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

export function formatLongDate(value: Date | string | null | undefined, fallback = '-'): string {
  const date = toDate(value)
  return date ? format(date, 'MMMM dd, yyyy') : fallback
}

export function formatClockTime(value: Date | string | null | undefined): string {
  const date = toDate(value)
  return date ? format(date, 'hh:mm:ss') : '-'
}

export function formatNiceDate(date: Date): string {
  if (!isValidDate(date)) return 'Invalid Date'
  return isToday(date) ? format(date, 'hh:mm aa') : format(date, 'MMMM d')
}
