const CSV_HEADERS = [
  'Project ID',
  'Project Name',
  'Project Description',
  'Task ID',
  'Task Name',
  'Task Description',
  'Task Priority',
  'Task Status',
  'Session ID',
  'Session Description',
  'Session Flow',
  'Session Start',
  'Session End',
  'Session Duration (minutes)',
  'Session Duration (seconds)',
  'Session Duration (hours)',
  'Session Duration (HH:mm:ss)',
]

const CSV_SPECIAL_CHARACTERS_RE = /[",\n\r]/

export const JSON_EXPORT_FILENAME = 'timeTrackerData.json'

export function serializeUser(user: User): string {
  return JSON.stringify(user, null, 2)
}

export function convertToCsv(user: User, dateRange: DateRange): string {
  const rows: string[][] = []

  for (const project of user.projects) {
    for (const task of project.tasks) {
      for (const session of task.sessions) {
        if (!isStartInDateRange(session.start, dateRange)) continue

        rows.push([
          project.id,
          project.name,
          project.description ?? '',
          task.id,
          task.name,
          task.description ?? '',
          task.priority,
          task.status,
          session.id,
          session.description ?? '',
          session.flow,
          session.start.toISOString(),
          session.end?.toISOString() ?? '',
          ...formatCsvDuration(session),
        ])
      }
    }
  }

  return [CSV_HEADERS, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n')
}

export function getCsvFilename(dateRange: DateRange): string {
  return `timeTrackerData_${formatRangeFileSuffix(dateRange)}.csv`
}

export function downloadFile(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function isStartInDateRange(start: Date, dateRange: DateRange) {
  const from = dateRange.from ? dateRange.from.getTime() : Number.NEGATIVE_INFINITY
  const to = dateRange.to ? new Date(dateRange.to).setHours(23, 59, 59, 999) : Number.POSITIVE_INFINITY
  return start.getTime() >= from && start.getTime() <= to
}

function formatCsvDuration(session: Session): string[] {
  if (!session.end) return ['', '', '', '']

  const seconds = (session.end.getTime() - session.start.getTime()) / 1000
  const minutes = seconds / 60
  const hours = minutes / 60
  const clock = [Math.floor(hours), Math.floor(minutes % 60), Math.floor(seconds % 60)]
    .map((part) => part.toString().padStart(2, '0'))
    .join(':')

  return [minutes.toFixed(2), seconds.toFixed(2), hours.toFixed(2), clock]
}

function escapeCsvValue(value: string) {
  return CSV_SPECIAL_CHARACTERS_RE.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}
