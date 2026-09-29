export function getPriorityComparison(values: Priority[], priority: Priority, noun: string): string {
  const high = values.filter((value) => value === 'high').length
  const medium = values.filter((value) => value === 'medium').length
  const low = values.filter((value) => value === 'low').length

  switch (priority) {
    case 'high':
      return `Higher priority than ${pluralize(low + medium, `other ${noun}`)}`
    case 'medium':
      return `Higher priority than ${pluralize(low, `other ${noun}`)}`
    case 'low':
      return `Lower priority than ${pluralize(high + medium, `other ${noun}`)}`
  }
}

export function getStatusComparison(values: string[], status: string, noun: string): string {
  const sameStatusCount = values.filter((value) => value === status).length - 1

  if (sameStatusCount === 0) return `No other ${noun}s have the same status`
  if (sameStatusCount === 1) return `1 other ${noun} has the same status`
  return `${sameStatusCount} other ${noun}s have the same status`
}

export function getMostRecentSessionDate(sessions: Session[], dateRange?: DateRange): Date {
  const times = sessions
    .filter((session) => !dateRange || isSessionInDateRange(session, dateRange))
    .map((session) => (session.end ?? session.start).getTime())
  return new Date(Math.max(...times))
}
