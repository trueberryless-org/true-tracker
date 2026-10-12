const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function getTaskAmountChartData(user: User, dateRange: DateRange | undefined): ChartSlice[] {
  const counts = user.projects
    .map((project) => ({
      name: project.name,
      tasks: dateRange?.from
        ? project.tasks.filter((task) => task.sessions.some((session) => isSessionInDateRange(session, dateRange)))
            .length
        : project.tasks.length,
    }))
    .sort((a, b) => b.tasks - a.tasks)

  const top = counts.slice(0, 4)
  const other = counts.slice(4).reduce((total, project) => total + project.tasks, 0)

  return [
    ...top.map((project, index) => ({
      color: `hsl(var(--chart-${index + 1}))`,
      label: project.name,
      value: project.tasks,
    })),
    { color: 'hsl(var(--chart-5))', label: 'Other', value: other },
  ]
}

export function getTaskAmountHelperText(data: ChartSlice[]): string {
  const nonEmpty = data.filter((slice) => slice.value !== 0)
  const [first, second] = data

  if (nonEmpty.length >= 2 && first && second) {
    return `${first.label} has ${(first.value / second.value) * 100 - 100}% more tasks`
  }
  if (nonEmpty.length === 1 && first) return `${first.label} has ${pluralize(first.value, 'task')}`
  return 'Nothing to show'
}

export function getFlowRadarSeries(user: User, dateRange: DateRange | undefined): RadarSeries[] {
  const sessions = user.projects.flatMap((project) =>
    project.tasks.flatMap((task) =>
      task.sessions
        .filter((session) => !dateRange?.from || isSessionInDateRange(session, dateRange))
        .map((session) => ({ flow: session.flow, priority: task.priority })),
    ),
  )

  return priorities.map((priority, index) => ({
    color: `hsl(var(--chart-${index + 1}))`,
    key: priority.value,
    label: priority.label,
    values: flows.map(
      (flow) => sessions.filter((session) => session.flow === flow.value && session.priority === priority.value).length,
    ),
  }))
}

export function getFlowRadarHelperText(series: RadarSeries[]): string {
  const totalsByFlow = flows.map((flow, index) => ({
    label: flow.label,
    total: series.reduce((sum, s) => sum + (s.values[index] ?? 0), 0),
  }))
  const total = totalsByFlow.reduce((sum, flow) => sum + flow.total, 0)
  if (total === 0) return 'No sessions during this period.'

  const highest = totalsByFlow.reduce((max, flow) => (flow.total > max.total ? flow : max))
  return `Of ${total} sessions, ${((highest.total / total) * 100).toFixed(2)}% are in "${highest.label}".`
}

export function getVisitsByWeekday(user: User, now = new Date()): VisitsChart {
  const counts = Array.from({ length: 7 }, () => 0)
  for (const visit of user.visits) counts[visit.time.getDay()]!++

  return createVisitsChart(
    WEEK_ORDER.map((day) => ({ label: WEEKDAYS[day]!, shortLabel: WEEKDAYS[day]!.slice(0, 3), value: counts[day]! })),
    counts[now.getDay()]!,
    `of average on ${WEEKDAYS[now.getDay()]}`,
  )
}

export function getVisitsByMonth(user: User, now = new Date()): VisitsChart {
  const counts = Array.from({ length: 12 }, () => 0)
  for (const visit of user.visits) counts[visit.time.getMonth()]!++

  return createVisitsChart(
    MONTHS.map((month, index) => ({ label: month, shortLabel: month.slice(0, 3), value: counts[index]! })),
    counts[now.getMonth()]!,
    `of average in ${MONTHS[now.getMonth()]}`,
  )
}

export function getVisitsByYear(user: User, now = new Date()): VisitsChart {
  const currentYear = now.getFullYear()
  const years = Array.from({ length: 10 }, (_, index) => currentYear - 9 + index)
  const counts = new Map(years.map((year) => [year, 0]))

  for (const visit of user.visits) {
    const year = visit.time.getFullYear()
    const count = counts.get(year)
    if (count !== undefined) counts.set(year, count + 1)
  }

  return createVisitsChart(
    years.map((year) => ({ label: String(year), value: counts.get(year) ?? 0 })),
    counts.get(currentYear) ?? 0,
    `of average in ${currentYear}`,
  )
}

export function formatVisitPercentage(current: number, average: number): string {
  const difference = (current / average - 1) * 100
  return `${difference >= 0 ? '+' : ''}${difference.toFixed(1)}%`
}

function createVisitsChart(data: BarDatum[], current: number, periodText: string): VisitsChart {
  const periodsWithVisits = data.filter((datum) => datum.value > 0).length
  const total = data.reduce((sum, datum) => sum + datum.value, 0)
  const average = periodsWithVisits > 0 ? total / periodsWithVisits : 0

  return { average, current, data, periodText }
}

export interface VisitsChart {
  average: number
  current: number
  data: BarDatum[]
  periodText: string
}
