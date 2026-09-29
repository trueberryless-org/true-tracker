export interface SessionDraft {
  end: Date | null
  session?: Session
  start: Date
  taskId?: string
}
