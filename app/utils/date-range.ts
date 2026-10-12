import { format } from 'date-fns'

export function isInDateRange(start: Date, end: Date | null, dateRange: DateRange): boolean {
  if (!dateRange.from) return true

  const rangeEnd = new Date(dateRange.to ?? dateRange.from)
  rangeEnd.setHours(23, 59, 59, 999)

  return start.getTime() >= dateRange.from.getTime() && (end ?? start).getTime() <= rangeEnd.getTime()
}

export function formatRangeText(dateRange: DateRange | undefined, now = new Date()): string {
  if (!dateRange?.from) return 'All time'

  const { from, to } = dateRange
  const isOtherYear = from.getFullYear() !== now.getFullYear()

  if (!to) return isOtherYear ? format(from, 'd MMMM yyyy') : format(from, 'MMMM d')
  if (isOtherYear) return `${format(from, 'd MMMM yyyy')} - ${format(to, 'd MMMM yyyy')}`
  return `${format(from, 'MMMM d')} - ${format(to, 'MMMM d')}`
}

export function formatRangeFileSuffix(dateRange: DateRange, now = new Date()): string {
  return `${formatIsoDay(dateRange.from ?? now)}_to_${formatIsoDay(dateRange.to ?? now)}`
}

function formatIsoDay(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

export interface DateRange {
  from?: Date
  to?: Date
}
