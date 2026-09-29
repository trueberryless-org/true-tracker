export const RECORD_COLLECTIONS = ['project', 'task', 'session', 'visit', 'settings'] as const

export const SETTINGS_RKEY = 'self'

export function createEmptyRecordSet(): RecordSet {
  return { project: {}, session: {}, settings: {}, task: {}, visit: {} }
}

export function userToRecordSet(user: User, profilePictureBlob?: unknown): RecordSet {
  const records = createEmptyRecordSet()

  for (const [projectIndex, project] of user.projects.entries()) {
    records.project[project.id] = compact({
      archivedAt: project.archivedAt?.toISOString(),
      createdAt: project.createdAt?.toISOString(),
      description: project.description,
      lastUpdatedAt: project.lastUpdatedAt?.toISOString(),
      name: project.name,
      position: projectIndex,
      priority: project.priority,
      status: project.status,
    })

    for (const [taskIndex, task] of project.tasks.entries()) {
      records.task[task.id] = compact({
        description: task.description,
        name: task.name,
        position: taskIndex,
        priority: task.priority,
        project: project.id,
        status: task.status,
      })

      for (const [sessionIndex, session] of task.sessions.entries()) {
        records.session[session.id] = compact({
          description: session.description,
          end: session.end?.toISOString(),
          flow: session.flow,
          position: sessionIndex,
          start: session.start.toISOString(),
          task: task.id,
        })
      }
    }
  }

  for (const visit of user.visits) records.visit[visit.id] = { time: visit.time.toISOString() }

  records.settings[SETTINGS_RKEY] = compact({
    ...user.settings.automation,
    exportReminder: user.settings.exportReminder,
    lastExported: user.settings.lastExported.toISOString(),
    profilePicture: profilePictureBlob,
    theme: user.settings.theme,
    username: user.username,
  })

  return records
}

export function recordSetToUser(records: RecordSet, options: RecordSetToUserOptions): User {
  const sessionsByTask = groupByParent(records.session, 'task')
  const tasksByProject = groupByParent(records.task, 'project')
  const settings = records.settings[SETTINGS_RKEY]

  return parseUser({
    id: options.did,
    isCurrentlyInTestMode: false,
    profilePicture: options.profilePicture ?? null,
    projects: sortByPosition(records.project).map(([projectId, project]) => ({
      ...project,
      id: projectId,
      archivedAt: project.archivedAt ?? null,
      tasks: (tasksByProject.get(projectId) ?? []).map(([taskId, task]) => ({
        ...task,
        id: taskId,
        sessions: (sessionsByTask.get(taskId) ?? []).map(([sessionId, session]) => ({
          ...session,
          end: session.end ?? null,
          id: sessionId,
        })),
      })),
    })),
    settings: {
      automation: Object.fromEntries(AUTOMATION_KEYS.map((key) => [key, settings?.[key] ?? true])),
      exportReminder: settings?.exportReminder,
      lastExported: settings?.lastExported,
      theme: settings?.theme,
    },
    username: typeof settings?.username === 'string' ? settings.username : options.handle,
    version: DATA_VERSION,
    visits: Object.entries(records.visit)
      .map(([id, visit]) => ({ id, time: visit.time }))
      .sort((a, b) => String(b.time).localeCompare(String(a.time))),
  })
}

export function diffRecordSets(previous: RecordSet, next: RecordSet): RecordOperation[] {
  const operations: RecordOperation[] = []

  for (const collection of RECORD_COLLECTIONS) {
    const before = previous[collection]
    const after = next[collection]

    for (const [rkey, value] of Object.entries(after)) {
      if (!(rkey in before) || serializeRecord(before[rkey]) !== serializeRecord(value)) {
        operations.push({ collection, rkey, type: 'put', value })
      }
    }
    for (const rkey of Object.keys(before)) {
      if (!(rkey in after)) operations.push({ collection, rkey, type: 'delete' })
    }
  }

  return operations
}

export function applyRecordOperations(records: RecordSet, operations: RecordOperation[]): RecordSet {
  const result = cloneRecordSet(records)

  for (const operation of operations) {
    if (operation.type === 'put') result[operation.collection][operation.rkey] = operation.value
    else delete result[operation.collection][operation.rkey]
  }

  return result
}

export function cloneRecordSet(records: RecordSet): RecordSet {
  return {
    project: { ...records.project },
    session: { ...records.session },
    settings: { ...records.settings },
    task: { ...records.task },
    visit: { ...records.visit },
  }
}

export function isRecordSetEmpty(records: RecordSet): boolean {
  return RECORD_COLLECTIONS.every((collection) => Object.keys(records[collection]).length === 0)
}

function serializeRecord(value: RecordValue | undefined) {
  if (!value) return ''
  return JSON.stringify(
    Object.keys(value)
      .sort()
      .map((key) => [key, value[key]]),
  )
}

function compact(value: RecordValue): RecordValue {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined))
}

function groupByParent(records: Record<string, RecordValue>, parentKey: string) {
  const groups = new Map<string, [string, RecordValue][]>()
  for (const entry of sortByPosition(records)) {
    const parent = String(entry[1][parentKey])
    const group = groups.get(parent) ?? []
    group.push(entry)
    groups.set(parent, group)
  }
  return groups
}

function sortByPosition(records: Record<string, RecordValue>): [string, RecordValue][] {
  return Object.entries(records).sort(
    ([, a], [, b]) =>
      (typeof a.position === 'number' ? a.position : Number.MAX_SAFE_INTEGER) -
      (typeof b.position === 'number' ? b.position : Number.MAX_SAFE_INTEGER),
  )
}

export type RecordCollection = (typeof RECORD_COLLECTIONS)[number]
export type RecordValue = Record<string, unknown>
export type RecordSet = Record<RecordCollection, Record<string, RecordValue>>

export type RecordOperation =
  | { collection: RecordCollection; rkey: string; type: 'put'; value: RecordValue }
  | { collection: RecordCollection; rkey: string; type: 'delete' }

interface RecordSetToUserOptions {
  did: string
  handle: string
  profilePicture?: string | null
}
