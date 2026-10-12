import { format } from 'date-fns'

export function createSession(now = Date.now()): Session {
  return {
    end: new Date(now),
    flow: 'good',
    id: crypto.randomUUID(),
    start: new Date(now - 3 * 60 * 60 * 1000),
  }
}

export function getSessionDuration(session: Session, now = Date.now()): number {
  return (session.end ? session.end.getTime() : now) - session.start.getTime()
}

export function isSessionInDateRange(session: Session, dateRange: DateRange): boolean {
  return isInDateRange(session.start, session.end, dateRange)
}

export function getAllSessions(user: User): Session[] {
  return user.projects.flatMap((project) => project.tasks.flatMap((task) => task.sessions))
}

export function findSessionContext(user: User, sessionId: string): SessionContext | undefined {
  for (const project of user.projects) {
    for (const task of project.tasks) {
      const session = task.sessions.find((s) => s.id === sessionId)
      if (session) return { project, session, task }
    }
  }
  return undefined
}

export function getFlowComparison(user: User, flow: Flow): string {
  const counts = countSessionsByFlow(getAllSessions(user))

  switch (flow) {
    case 'smooth':
      return `Better flow than ${pluralize(counts.disrupted + counts.neutral + counts.good, 'other session')}`
    case 'good':
      return `Better flow than ${pluralize(counts.disrupted + counts.neutral, 'other session')}`
    case 'neutral':
      return `Worse flow than ${pluralize(counts.smooth + counts.good, 'other session')}`
    case 'disrupted':
      return `Worse flow than ${pluralize(counts.smooth + counts.good + counts.neutral, 'other session')}`
  }
}

export function getDurationComparison(user: User, session: Session, now = Date.now()): string {
  const sessions = getAllSessions(user)
  const currentDuration = getSessionDuration(session, now)
  const averageDuration = sessions.length
    ? sessions.reduce((total, s) => total + getSessionDuration(s, now), 0) / sessions.length
    : 0

  const others = sessions.filter((s) => s.id !== session.id).map((s) => getSessionDuration(s, now))

  if (currentDuration > averageDuration) {
    return `Longer than ${pluralize(others.filter((duration) => duration < currentDuration).length, 'other session')}`
  }
  return `Shorter than ${pluralize(others.filter((duration) => duration > currentDuration).length, 'other session')}`
}

export function getSessionTimeDescription(session: Session): string {
  const day = format(session.start, 'MMMM d')
  const start = format(session.start, 'hh:mm aa')
  return `${day}: ${start} - ${session.end ? format(session.end, 'hh:mm aa') : 'Running'}`
}

function countSessionsByFlow(sessions: Session[]): Record<Flow, number> {
  const counts: Record<Flow, number> = { disrupted: 0, good: 0, neutral: 0, smooth: 0 }
  for (const session of sessions) counts[session.flow]++
  return counts
}

export interface SessionContext {
  project: Project
  session: Session
  task: Task
}
