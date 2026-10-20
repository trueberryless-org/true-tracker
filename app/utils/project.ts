export function createProject(now = new Date()): Project {
  return {
    archivedAt: null,
    createdAt: now,
    id: crypto.randomUUID(),
    lastUpdatedAt: now,
    name: 'New Project',
    priority: 'medium',
    status: 'planned',
    tasks: [],
  }
}

export function getProjectDuration(project: Project, dateRange?: DateRange, now = Date.now()): number {
  return project.tasks.reduce((total, task) => total + getTaskDuration(task, dateRange, now), 0)
}

export function getMostRecentSessionDateOfProject(project: Project): Date {
  return getMostRecentSessionDate(project.tasks.flatMap((task) => task.sessions))
}

export function isProjectArchived(project: Project | undefined): boolean {
  return Boolean(project?.archivedAt)
}

export function getProjectWithMostDuration(user: User, dateRange?: DateRange): Project | null {
  let maxDuration = 0
  let result: Project | null = null

  for (const project of user.projects) {
    const duration = getProjectDuration(project, dateRange)
    if (duration > maxDuration) {
      maxDuration = duration
      result = project
    }
  }

  return result
}

export function getProjectPriorityComparison(user: User, priority: Priority): string {
  return getPriorityComparison(
    user.projects.map((project) => project.priority),
    priority,
    'project',
  )
}

export function getProjectStatusComparison(user: User, status: ProjectStatus): string {
  return getStatusComparison(
    user.projects.map((project) => project.status),
    status,
    'project',
  )
}
