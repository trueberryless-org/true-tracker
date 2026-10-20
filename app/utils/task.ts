export function createTask(): Task {
  return {
    id: crypto.randomUUID(),
    name: 'New Task',
    priority: 'medium',
    sessions: [],
    status: 'backlog',
  }
}

export function getAllTasks(user: User): Task[] {
  return user.projects.flatMap((project) => project.tasks)
}

export function findTaskContext(user: User, taskId: string): TaskContext | undefined {
  for (const project of user.projects) {
    const task = project.tasks.find((t) => t.id === taskId)
    if (task) return { project, task }
  }
  return undefined
}

export function getTaskDuration(task: Task, dateRange?: DateRange, now = Date.now()): number {
  return task.sessions
    .filter((session) => !dateRange || isSessionInDateRange(session, dateRange))
    .reduce((total, session) => total + getSessionDuration(session, now), 0)
}

export function getCompletedTaskDuration(task: Task): number {
  return task.sessions.reduce(
    (total, session) => (session.end ? total + session.end.getTime() - session.start.getTime() : total),
    0,
  )
}

export function getMostRecentSessionDateOfTask(task: Task, dateRange?: DateRange): Date {
  return getMostRecentSessionDate(task.sessions, dateRange)
}

export function isTaskRunning(task: Task): boolean {
  return task.sessions.some((session) => session.end === null)
}

export function getTaskPriorityComparison(user: User, priority: Priority): string {
  return getPriorityComparison(
    getAllTasks(user).map((task) => task.priority),
    priority,
    'task',
  )
}

export function getTaskStatusComparison(user: User, status: TaskStatus): string {
  return getStatusComparison(
    getAllTasks(user).map((task) => task.status),
    status,
    'task',
  )
}

export function getTaskWithMostDuration(
  user: User,
  dateRange?: DateRange,
  excludedIds: string[] = [],
): Task | undefined {
  let maxDuration = 0
  let result: Task | undefined

  for (const task of getAllTasks(user)) {
    if (excludedIds.includes(task.id)) continue
    const duration = getTaskDuration(task, dateRange)
    if (duration > maxDuration) {
      maxDuration = duration
      result = task
    }
  }

  return result
}

export interface TaskContext {
  project: Project
  task: Task
}
