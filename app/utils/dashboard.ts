import { format } from 'date-fns'

import type { Flow } from './models'

const ALL_FLOWS: Flow[] = ['smooth', 'good', 'neutral', 'disrupted']

export function getWorkingTime(user: User, dateRange: DateRange | undefined, flowFilter = ALL_FLOWS): number {
  return getAllSessions(user)
    .filter((session) => (!dateRange || isSessionInDateRange(session, dateRange)) && flowFilter.includes(session.flow))
    .reduce((total, session) => total + getSessionDuration(session), 0)
}

export function getSmoothWorkingShare(user: User, dateRange: DateRange | undefined): string {
  return ((getWorkingTime(user, dateRange, ['smooth']) / getWorkingTime(user, dateRange)) * 100).toFixed(2)
}

export function getProjectDurationInfoText(user: User, dateRange?: DateRange): string {
  return getLeadInfoText(
    user.projects.map((project) => getProjectDuration(project, dateRange)),
    'No other projects',
  )
}

export function getTaskDurationInfoText(user: User, dateRange?: DateRange): string {
  return getLeadInfoText(
    getAllTasks(user).map((task) => getTaskDuration(task, dateRange)),
    'No other tasks',
  )
}

export function getMostRecentSessionDateOfUser(user: User, dateRange?: DateRange): Date {
  return getMostRecentSessionDate(getAllSessions(user), dateRange)
}

export function getRecentTasksInfoText(user: User, dateRange: DateRange | undefined): string {
  if (!dateRange?.from) return `You worked on ${pluralize(getAllTasks(user).length, 'task')}.`

  const count = getAllTasks(user).filter((task) =>
    task.sessions.some((session) => isSessionInDateRange(session, dateRange)),
  ).length
  return `You worked on ${pluralize(count, 'task')}${formatRangeSuffix(dateRange)}.`
}

export function getRecentSessionsInfoText(user: User, dateRange: DateRange | undefined): string {
  if (!dateRange?.from) return `You worked on ${pluralize(getAllSessions(user).length, 'session')}.`

  const count = getAllSessions(user).filter((session) => isSessionInDateRange(session, dateRange)).length
  return `You worked on ${pluralize(count, 'session')}${formatRangeSuffix(dateRange)}.`
}

export function shouldShowExportNotification(user: User, now = new Date()): boolean {
  const lastExported = user.settings.lastExported.getTime()
  const threshold = new Date(now)

  switch (user.settings.exportReminder) {
    case 'daily':
      threshold.setDate(threshold.getDate() - 1)
      break
    case 'weekly':
      threshold.setDate(threshold.getDate() - 7)
      break
    case 'monthly':
      threshold.setMonth(threshold.getMonth() - 1)
      break
  }

  return lastExported <= threshold.getTime()
}

function getLeadInfoText(durations: number[], emptyText: string): string {
  let max = 0
  let second = 0

  for (const duration of durations) {
    if (duration > max) {
      second = max
      max = duration
    } else if (duration > second) {
      second = duration
    }
  }

  if (max > 0 && second > 0) return `${(((max - second) / second) * 100).toFixed(2)}% more than second`
  return emptyText
}

function formatRangeSuffix(dateRange: DateRange) {
  if (!dateRange.from) return ''
  if (!dateRange.to) return ` on ${format(dateRange.from, 'MMMM d')}`
  return ` between ${format(dateRange.from, 'MMMM d')} and ${format(dateRange.to, 'MMMM d')}`
}
