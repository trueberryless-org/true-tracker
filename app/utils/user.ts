import { z } from 'zod'

import {
  EXPORT_REMINDERS,
  FLOWS,
  PRIORITIES,
  PROJECT_STATUSES,
  TASK_STATUSES,
  THEMES,
} from '~~/shared/atproto/lexicons'

const DATE_SCHEMA = z.union([z.string(), z.number(), z.date()]).transform((value, context) => {
  const date = toDate(value)
  if (!date) {
    context.addIssue({ code: 'custom', message: 'Invalid date.' })
    return z.NEVER
  }
  return date
})

const NULLABLE_DATE_SCHEMA = z
  .union([z.string(), z.number(), z.date(), z.null()])
  .optional()
  .transform((value) => toDate(value))

const OPTIONAL_DATE_SCHEMA = NULLABLE_DATE_SCHEMA.transform((date) => date ?? undefined)

const SESSION_SCHEMA = z.object({
  description: z.string().optional(),
  end: NULLABLE_DATE_SCHEMA,
  flow: z.enum(FLOWS),
  id: z.string(),
  start: DATE_SCHEMA,
})

const TASK_SCHEMA = z.object({
  description: z.string().optional(),
  id: z.string(),
  name: z.string(),
  priority: z.enum(PRIORITIES),
  sessions: z.array(SESSION_SCHEMA),
  status: z.enum(TASK_STATUSES),
})

const PROJECT_SCHEMA = z.object({
  archivedAt: NULLABLE_DATE_SCHEMA,
  createdAt: OPTIONAL_DATE_SCHEMA,
  description: z.string().optional(),
  id: z.string(),
  lastUpdatedAt: OPTIONAL_DATE_SCHEMA,
  name: z.string(),
  priority: z.enum(PRIORITIES),
  status: z.enum(PROJECT_STATUSES),
  tasks: z.array(TASK_SCHEMA),
})

const AUTOMATION_SCHEMA = z.object({
  archiveProjectStatusRetirement: z.boolean().catch(true),
  archiveStopSessions: z.boolean().catch(true),
  archiveTaskStatusRetirement: z.boolean().catch(true),
  projectStatusKickoff: z.boolean().catch(true),
  projectStatusRetirement: z.boolean().catch(true),
  taskStatusKickoff: z.boolean().catch(true),
  taskStatusRetirement: z.boolean().catch(true),
})

const USER_SCHEMA = z.object({
  id: z.string(),
  isCurrentlyInTestMode: z.boolean().optional().default(false),
  profilePicture: z.string().nullish(),
  projects: z.array(PROJECT_SCHEMA),
  settings: z.object({
    automation: AUTOMATION_SCHEMA.catch(() => createDefaultAutomation()),
    exportReminder: z.enum(EXPORT_REMINDERS).catch('weekly'),
    lastExported: DATE_SCHEMA.catch(() => new Date()),
    theme: z.enum(THEMES).catch('default'),
  }),
  username: z.string(),
  version: z.object({ major: z.number(), minor: z.number(), patch: z.number() }),
  visits: z.array(z.object({ id: z.string(), time: DATE_SCHEMA })).catch([]),
})

export function createUser(username: string): User {
  return {
    id: crypto.randomUUID(),
    isCurrentlyInTestMode: false,
    projects: [],
    settings: {
      automation: createDefaultAutomation(),
      exportReminder: 'weekly',
      lastExported: new Date(),
      theme: 'default',
    },
    username,
    version: DATA_VERSION,
    visits: [],
  }
}

export function createDefaultAutomation(): Settings['automation'] {
  return {
    archiveProjectStatusRetirement: true,
    archiveStopSessions: true,
    archiveTaskStatusRetirement: true,
    projectStatusKickoff: true,
    projectStatusRetirement: true,
    taskStatusKickoff: true,
    taskStatusRetirement: true,
  }
}

export function parseUser(data: unknown): User {
  return USER_SCHEMA.parse(data)
}

export function isOutdatedData(data: RawData): boolean {
  return !isSameVersion(data.version, DATA_VERSION)
}

export function addVisit(user: User, time = new Date()): User {
  return { ...user, visits: [{ id: crypto.randomUUID(), time }, ...user.visits] }
}

export function validateUsername(username: string): string | null {
  return username.length < 2 ? 'Username must be at least 2 characters.' : null
}
