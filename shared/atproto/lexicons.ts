import { defineLexicons, field, record, space } from 'airspace/lexicon'

export const PROJECT_STATUSES = ['planned', 'in progress', 'in review', 'completed', 'on hold', 'canceled'] as const
export const TASK_STATUSES = ['backlog', 'todo', 'in progress', 'done', 'canceled'] as const
export const PRIORITIES = ['low', 'medium', 'high'] as const
export const FLOWS = ['smooth', 'good', 'neutral', 'disrupted'] as const
export const THEMES = [
  'default',
  'palette',
  'amethyst',
  'sapphire',
  'emerald',
  'ruby',
  'coral',
  'amber',
  'daylight',
  'midnight',
] as const
export const EXPORT_REMINDERS = ['daily', 'weekly', 'monthly'] as const

export const lexicons = defineLexicons('space.time-tracker', {
  project: record(
    {
      name: field.text({ max: 500 }),
      description: field.text({ max: 10_000 }).optional(),
      status: field.enum(PROJECT_STATUSES),
      priority: field.enum(PRIORITIES),
      createdAt: field.datetime().optional(),
      lastUpdatedAt: field.datetime().optional(),
      archivedAt: field.datetime().optional().describe('When the project was archived; absent while it is active.'),
      position: field.number().optional().describe('Order of the project in the list; absent means the end.'),
    },
    { key: 'any', description: 'A project that groups tasks. The record key is the project identifier.' },
  ),

  task: record(
    {
      project: field.text({ max: 512 }).describe('Record key of the owning project.'),
      name: field.text({ max: 500 }),
      description: field.text({ max: 10_000 }).optional(),
      status: field.enum(TASK_STATUSES),
      priority: field.enum(PRIORITIES),
      position: field.number().optional().describe('Order of the task within its project; absent means the end.'),
    },
    { key: 'any', description: 'A task belonging to a project. The record key is the task identifier.' },
  ),

  session: record(
    {
      task: field.text({ max: 512 }).describe('Record key of the owning task.'),
      description: field.text({ max: 10_000 }).optional(),
      flow: field.enum(FLOWS),
      start: field.datetime(),
      end: field.datetime().optional().describe('When the session ended; absent while it is still running.'),
      position: field.number().optional().describe('Order of the session within its task; absent means the end.'),
    },
    { key: 'any', description: 'A tracked work session on a task. The record key is the session identifier.' },
  ),

  visit: {
    key: 'any',
    description: 'One visit of the app, shown in the visits chart. The record key is the visit identifier.',
    time: field.datetime(),
  },

  settings: {
    key: 'self',
    description: 'Display name, appearance and automation preferences.',
    username: field.text({ max: 200 }),
    profilePicture: field.image({ max: 1_000_000 }).optional(),
    theme: field.enum(THEMES),
    exportReminder: field.enum(EXPORT_REMINDERS),
    lastExported: field.datetime(),
    archiveStopSessions: field.boolean(),
    archiveProjectStatusRetirement: field.boolean(),
    archiveTaskStatusRetirement: field.boolean(),
    projectStatusKickoff: field.boolean(),
    projectStatusRetirement: field.boolean(),
    taskStatusKickoff: field.boolean(),
    taskStatusRetirement: field.boolean(),
  },

  vault: space(['project', 'task', 'session', 'visit', 'settings'], {
    key: 'self',
    name: 'Time Tracker',
    description: 'Private projects, tasks, sessions, visits and settings.',
  }),
})
