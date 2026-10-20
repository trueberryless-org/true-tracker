const PROJECT_COLOR_COUNT = 5

export function getCalendarEvents(user: User, options: CalendarEventOptions = {}): CalendarEvent[] {
  const { taskId } = options

  return user.projects.flatMap((project, projectIndex) =>
    project.tasks
      .filter((task) => !taskId || task.id === taskId)
      .flatMap((task) =>
        task.sessions.map((session) => ({
          color: `hsl(var(--chart-${(projectIndex % PROJECT_COLOR_COUNT) + 1}))`,
          end: session.end,
          flow: session.flow,
          id: session.id,
          isReadOnly: isProjectArchived(project),
          projectName: project.name,
          start: session.start,
          taskId: task.id,
          taskName: task.name,
        })),
      ),
  )
}

export function getEditableTasks(user: User): EditableTask[] {
  return user.projects
    .filter((project) => !isProjectArchived(project))
    .flatMap((project) => project.tasks.map((task) => ({ id: task.id, label: `${project.name} - ${task.name}` })))
}

export interface CalendarEventOptions {
  taskId?: string
}

export interface EditableTask {
  id: string
  label: string
}
