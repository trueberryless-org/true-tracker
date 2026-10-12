const UPGRADES: Upgrade[] = [
  { from: '0.1.0', to: { major: 0, minor: 2, patch: 0 }, upgrade: upgradeFrom010To020 },
  { from: '0.2.0', to: { major: 0, minor: 3, patch: 0 }, upgrade: upgradeFrom020To030 },
]

export function isSameVersion(a: Version | undefined, b: Version | undefined): boolean {
  if (!a || !b) return false
  return a.major === b.major && a.minor === b.minor && a.patch === b.patch
}

export function upgradeData(data: RawData, target: Version = DATA_VERSION): RawData {
  let current: Version = data.version ?? { major: 0, minor: 1, patch: 0 }

  while (!isSameVersion(current, target)) {
    const step = UPGRADES.find((upgrade) => upgrade.from === formatVersion(current))
    if (!step) throw new Error(`No upgrade path found from data version \`${formatVersion(current)}\`.`)

    data = { ...step.upgrade(data), version: step.to }
    current = step.to
  }

  return data
}

export function formatVersion(version: Version): string {
  return `${version.major}.${version.minor}.${version.patch}`
}

function upgradeFrom010To020(data: RawData): RawData {
  const projects = (data.projects as RawData[] | undefined) ?? []
  return {
    ...data,
    projects: projects.map((project) => ({
      ...project,
      tasks: ((project.tasks as RawData[] | undefined) ?? []).map((task) => ({
        ...task,
        sessions: ((task.sessions as RawData[] | undefined) ?? []).map((session) => ({
          flow: 'good',
          id: crypto.randomUUID(),
          ...session,
        })),
      })),
    })),
  }
}

function upgradeFrom020To030(data: RawData): RawData {
  const { exportReminder, lastExported, theme, ...rest } = data
  const settings = (data.settings as RawData | undefined) ?? {}
  const automation = Object.fromEntries(AUTOMATION_KEYS.map((key) => [key, true]))

  return {
    ...rest,
    id: crypto.randomUUID(),
    settings: {
      exportReminder: exportReminder ?? 'weekly',
      lastExported: lastExported ?? new Date(),
      theme: theme ?? 'default',
      ...settings,
      automation: { ...automation, ...(settings.automation as RawData | undefined) },
    },
    visits: [],
  }
}

export type RawData = Record<string, unknown> & { version?: Version }

interface Upgrade {
  from: string
  to: Version
  upgrade: (data: RawData) => RawData
}
