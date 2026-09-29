const ALL: TableBreakpoint[] = ['mobile', 'sm', 'md', 'lg', 'xl']

export const projectColumns: TableColumn<ExtendedProject>[] = [
  { accessor: (row) => row.name, breakpoints: ALL, id: 'name', title: 'Name' },
  { accessor: (row) => row.description, breakpoints: ['lg', 'xl'], id: 'description', title: 'Description' },
  { accessor: (row) => row.createdAt, breakpoints: ['md', 'lg', 'xl'], id: 'createdAt', title: 'Created At' },
  { accessor: (row) => row.lastUpdatedAt, breakpoints: ['xl'], id: 'lastUpdatedAt', title: 'Last Updated At' },
  { accessor: (row) => row.status, breakpoints: ALL, id: 'status', title: 'Status' },
  { accessor: (row) => row.priority, breakpoints: ['sm', 'md', 'lg', 'xl'], id: 'priority', title: 'Priority' },
  { breakpoints: ['sm', 'md', 'lg', 'xl'], id: 'actions' },
]

export const taskColumns: TableColumn<ExtendedTask>[] = [
  { accessor: (row) => row.name, breakpoints: ALL, id: 'name', title: 'Name' },
  { accessor: (row) => row.description, breakpoints: ['xl'], id: 'description', title: 'Description' },
  { accessor: (row) => row.projectName, breakpoints: ['sm', 'md', 'lg', 'xl'], id: 'projectName', title: 'Project' },
  {
    accessor: (row) => getCompletedTaskDuration(row),
    breakpoints: ['lg', 'xl'],
    id: 'timeSpent',
    title: 'Time Running',
  },
  { accessor: (row) => row.status, breakpoints: ALL, id: 'status', title: 'Status' },
  { accessor: (row) => row.priority, breakpoints: ['md', 'lg', 'xl'], id: 'priority', title: 'Priority' },
  { breakpoints: ['sm', 'md', 'lg', 'xl'], id: 'actions' },
]

export const sessionColumns: TableColumn<ExtendedSession>[] = [
  { accessor: (row) => row.projectName, breakpoints: ['lg', 'xl'], id: 'projectName', title: 'Project' },
  { accessor: (row) => row.taskName, breakpoints: ['sm', 'md', 'lg', 'xl'], id: 'taskName', title: 'Task' },
  { accessor: (row) => row.description, breakpoints: ['xl'], id: 'description', title: 'Description' },
  { accessor: (row) => row.flow, breakpoints: ALL, id: 'flow', order: { mobile: 10 }, title: 'Flow' },
  { accessor: (row) => row.start, breakpoints: ALL, id: 'start', title: 'Start Time' },
  { accessor: (row) => row.end, breakpoints: ['md', 'lg', 'xl'], id: 'end', title: 'End Time' },
  {
    accessor: (row) => getSessionDuration(row),
    breakpoints: ['lg', 'xl'],
    id: 'duration',
    title: 'Duration',
  },
  { breakpoints: ['sm', 'md', 'lg', 'xl'], id: 'actions' },
]

export function getExtendedProjects(user: User): ExtendedProject[] {
  return user.projects
    .map((project) => ({
      ...project,
      mostRecentDate: getMostRecentSessionDateOfProject(project),
      projectIsArchived: isProjectArchived(project),
      someSessionIsRunning: project.tasks.some(isTaskRunning),
    }))
    .sort((a, b) => b.mostRecentDate.valueOf() - a.mostRecentDate.valueOf())
}

export function getExtendedTasks(user: User): ExtendedTask[] {
  return user.projects.flatMap((project) =>
    project.tasks.map((task) => ({
      ...task,
      projectIsArchived: isProjectArchived(project),
      projectName: project.name,
      someSessionIsRunning: isTaskRunning(task),
    })),
  )
}

export function getExtendedSessions(user: User): ExtendedSession[] {
  return user.projects.flatMap((project) =>
    project.tasks.flatMap((task) =>
      task.sessions.map((session) => ({
        ...session,
        projectIsArchived: isProjectArchived(project),
        projectName: project.name,
        taskName: task.name,
      })),
    ),
  )
}

export function getUniqueNames(names: string[]): FilterOption[] {
  return [...new Set(names)].map((name) => ({ label: name, value: name }))
}
