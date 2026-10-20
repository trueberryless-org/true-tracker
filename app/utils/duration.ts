const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function formatDurationLong(duration: number): string {
  const { hours, minutes, seconds } = splitDuration(duration)
  const parts: string[] = []

  if (hours > 0) parts.push(pluralize(hours, 'hour'))
  if (minutes > 0) parts.push(pluralize(minutes, 'minute'))
  if (seconds > 0 || parts.length === 0) parts.push(pluralize(seconds, 'second'))

  return parts.join(', ')
}

export function formatDurationShort(duration: number): string {
  const { hours, minutes, seconds } = splitDuration(duration)
  const parts: string[] = []

  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)

  return parts.join(' ')
}

export function formatDurationFitting(duration: number): string {
  const days = Math.floor(duration / DAY)
  const hours = Math.floor(duration / HOUR)
  const minutes = Math.floor(duration / MINUTE)
  const seconds = Math.floor(duration / SECOND)

  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return `${seconds}s`
}

export function formatDurationDaysOrSecondsLong(duration: number): string {
  const days = Math.floor(duration / DAY)
  if (days > 0) return pluralize(days, 'day')
  return pluralize(Math.floor(duration / SECOND), 'second')
}

export function formatElapsedSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`
}

export function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

function splitDuration(duration: number) {
  return {
    hours: Math.floor(duration / HOUR),
    minutes: Math.floor((duration / MINUTE) % 60),
    seconds: Math.floor((duration / SECOND) % 60),
  }
}
