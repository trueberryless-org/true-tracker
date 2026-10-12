import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Circle,
  CircleCheck,
  CircleDotDashed,
  CircleHelp,
  CirclePause,
  CircleX,
  Fish,
  PawPrint,
  Rabbit,
  Snail,
  Timer,
} from '@lucide/vue'
import type { Component } from 'vue'

import type {
  EXPORT_REMINDERS,
  FLOWS,
  PRIORITIES,
  PROJECT_STATUSES,
  TASK_STATUSES,
  THEMES,
} from '~~/shared/atproto/lexicons'

export const projectStatuses: Option<ProjectStatus>[] = [
  { icon: Circle, label: 'Planned', value: 'planned' },
  { icon: Timer, label: 'In Progress', value: 'in progress' },
  { icon: CircleDotDashed, label: 'In Review', value: 'in review' },
  { icon: CircleCheck, label: 'Completed', value: 'completed' },
  { icon: CirclePause, label: 'On Hold', value: 'on hold' },
  { icon: CircleX, label: 'Canceled', value: 'canceled' },
]

export const taskStatuses: Option<TaskStatus>[] = [
  { icon: CircleHelp, label: 'Backlog', value: 'backlog' },
  { icon: Circle, label: 'Todo', value: 'todo' },
  { icon: Timer, label: 'In Progress', value: 'in progress' },
  { icon: CircleCheck, label: 'Done', value: 'done' },
  { icon: CircleX, label: 'Canceled', value: 'canceled' },
]

export const priorities: Option<Priority>[] = [
  { icon: ArrowDown, label: 'Low', value: 'low' },
  { icon: ArrowRight, label: 'Medium', value: 'medium' },
  { icon: ArrowUp, label: 'High', value: 'high' },
]

export const flows: Option<Flow>[] = [
  { icon: Rabbit, label: 'Smooth', value: 'smooth' },
  { icon: PawPrint, label: 'Good', value: 'good' },
  { icon: Fish, label: 'Neutral', value: 'neutral' },
  { icon: Snail, label: 'Disrupted', value: 'disrupted' },
]

export const themes: { label: string; value: Theme }[] = [
  { label: 'Default', value: 'default' },
  { label: 'Palette', value: 'palette' },
  { label: 'Amethyst', value: 'amethyst' },
  { label: 'Sapphire', value: 'sapphire' },
  { label: 'Emerald', value: 'emerald' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Coral', value: 'coral' },
  { label: 'Amber', value: 'amber' },
  { label: 'Daylight', value: 'daylight' },
  { label: 'Midnight', value: 'midnight' },
]

export const automationSettings: AutomationSetting[] = [
  {
    description: 'Automatically stop all running sessions when a project gets archived.',
    group: 'Archive',
    key: 'archiveStopSessions',
    label: 'Archive Stop Sessions',
    toastActivate: 'Sessions will now automatically be stopped when the project gets archived.',
    toastDeactivate: 'Sessions will no longer automatically be stopped when the project gets archived.',
  },
  {
    description: 'Move project status to “Completed” when it gets archived.',
    group: 'Archive',
    key: 'archiveProjectStatusRetirement',
    label: 'Archive Project Status Retirement',
    toastActivate: 'Projects will now automatically be marked as “Completed” when they get archived.',
    toastDeactivate: 'Projects will no longer automatically be marked as “Completed” when they get archived.',
  },
  {
    description: 'Move task status to “Completed” when their project gets archived.',
    group: 'Archive',
    key: 'archiveTaskStatusRetirement',
    label: 'Archive Task Status Retirement',
    toastActivate: 'Tasks will now automatically be marked as “Completed” when their project gets archived.',
    toastDeactivate: 'Tasks will no longer automatically be marked as “Completed” when their project gets archived.',
  },
  {
    description: 'Mark projects as “In Progress” when a session is started.',
    group: 'Project',
    key: 'projectStatusKickoff',
    label: 'Project Status Kickoff',
    toastActivate: 'Projects will now automatically be marked as “In Progress” when a session is started.',
    toastDeactivate: 'Projects will no longer automatically be marked as “In Progress” when a session is started.',
  },
  {
    description: 'Mark projects as “Completed” when no session has been started for 3 months.',
    group: 'Project',
    key: 'projectStatusRetirement',
    label: 'Project Status Retirement',
    toastActivate:
      'Projects will now automatically be marked as “Completed” when no session has been started for 3 months.',
    toastDeactivate:
      'Projects will no longer automatically be marked as “Completed” when no session has been started for 3 months.',
  },
  {
    description: 'Mark tasks as “In Progress” when a session is started.',
    group: 'Task',
    key: 'taskStatusKickoff',
    label: 'Task Status Kickoff',
    toastActivate: 'Tasks will now automatically be marked as “In Progress” when a session is started.',
    toastDeactivate: 'Tasks will no longer automatically be marked as “In Progress” when a session is started.',
  },
  {
    description: 'Mark tasks as “Completed” when no session has been started for one month.',
    group: 'Task',
    key: 'taskStatusRetirement',
    label: 'Task Status Retirement',
    toastActivate:
      'Tasks will now automatically be marked as “Completed” when no session has been started for one month.',
    toastDeactivate:
      'Tasks will no longer automatically be marked as “Completed” when no session has been started for one month.',
  },
]

export const AUTOMATION_KEYS = [
  'archiveStopSessions',
  'archiveProjectStatusRetirement',
  'archiveTaskStatusRetirement',
  'projectStatusKickoff',
  'projectStatusRetirement',
  'taskStatusKickoff',
  'taskStatusRetirement',
] as const

export function findOption<T extends string>(options: Option<T>[], value: string | undefined): Option<T> | undefined {
  return options.find((option) => option.value === value)
}

export const DATA_VERSION: Version = {
  major: 0,
  minor: 3,
  patch: 0,
}

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]
export type TaskStatus = (typeof TASK_STATUSES)[number]
export type Priority = (typeof PRIORITIES)[number]
export type Flow = (typeof FLOWS)[number]
export type Theme = (typeof THEMES)[number]
export type ExportReminder = (typeof EXPORT_REMINDERS)[number]
export type AutomationKey = (typeof AUTOMATION_KEYS)[number]

export interface Option<T extends string = string> {
  icon: Component
  label: string
  value: T
}

export interface AutomationSetting {
  description: string
  group: string
  key: AutomationKey
  label: string
  toastActivate: string
  toastDeactivate: string
}

export interface Version {
  major: number
  minor: number
  patch: number
}

export interface Visit {
  id: string
  time: Date
}

export interface Session {
  description?: string
  end: Date | null
  flow: Flow
  id: string
  start: Date
}

export interface Task {
  description?: string
  id: string
  name: string
  priority: Priority
  sessions: Session[]
  status: TaskStatus
}

export interface Project {
  archivedAt?: Date | null
  createdAt?: Date
  description?: string
  id: string
  lastUpdatedAt?: Date
  name: string
  priority: Priority
  status: ProjectStatus
  tasks: Task[]
}

export interface Settings {
  automation: Record<AutomationKey, boolean>
  exportReminder: ExportReminder
  lastExported: Date
  theme: Theme
}

export interface User {
  id: string
  isCurrentlyInTestMode: boolean
  profilePicture?: string | null
  projects: Project[]
  settings: Settings
  username: string
  version: Version
  visits: Visit[]
}

export interface ExtendedProject extends Project {
  mostRecentDate: Date
  projectIsArchived: boolean
  someSessionIsRunning: boolean
}

export interface ExtendedTask extends Task {
  projectIsArchived: boolean
  projectName: string
  someSessionIsRunning: boolean
}

export interface ExtendedSession extends Session {
  projectIsArchived: boolean
  projectName: string
  taskName: string
}
