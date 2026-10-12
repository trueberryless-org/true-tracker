import { toast } from 'vue-sonner'

export function useTrackerUser() {
  return useState<User | null>('time-tracker-user', () => null)
}

export function useTrackerLoaded() {
  return useState('time-tracker-loaded', () => false)
}

export function useTracker() {
  const user = useTrackerUser()
  const loaded = useTrackerLoaded()
  const authUser = useAuthUser()
  const isAccount = computed(() => Boolean(authUser.value))

  return { isAccount, loaded, user }
}

export function saveUser(next: User) {
  useTrackerUser().value = next

  if (useAuthUser().value) {
    scheduleSync()
    return
  }

  writeLocalJson(LOCAL_DATA_KEY, next)
}

export function updateUser(recipe: (draft: User) => void) {
  const current = useTrackerUser().value
  if (!current) return

  const draft = structuredClone(toRaw(current))
  recipe(draft)
  saveUser(draft)
}

export function loadGuestUser() {
  const loaded = useTrackerLoaded()
  const raw = readLocalJson(LOCAL_DATA_KEY) as RawData | null

  if (!raw) {
    loaded.value = true
    return
  }

  try {
    let data = raw
    if (isOutdatedData(raw)) {
      downloadFile(JSON.stringify(raw, null, 2), JSON_EXPORT_FILENAME, 'application/json')
      data = upgradeData(raw)
      toast('We migrate your data to the latest version.')
    }

    const user = addVisit(parseUser(data))
    applyColorTheme(user.settings.theme)
    saveUser(user)
  } catch (error) {
    console.error('[time-tracker] Failed to read the data stored on this device.', error)
    toast('Your stored data could not be read. Please import a backup.')
  } finally {
    loaded.value = true
  }
}

export function adoptGuestDataFromOtherTab() {
  const raw = readLocalJson(LOCAL_DATA_KEY)
  if (!raw) {
    useTrackerUser().value = null
    return
  }

  try {
    const user = parseUser(raw)
    useTrackerUser().value = user
    applyColorTheme(user.settings.theme)
  } catch (error) {
    console.error('[time-tracker] Failed to read the data another tab stored on this device.', error)
  }
}

export function signUpLocally(username: string) {
  saveUser(createUser(username))
  toast(`You sign up with the username "${username}".`)
}

export async function startTestMode() {
  const response = await fetch('/data/test_user.json')
  const user = parseUser(await response.json())
  const now = Date.now()

  for (const project of user.projects) {
    project.createdAt = getRandomDateWithinLastMonths(6, now)
    project.lastUpdatedAt = getRandomDateWithinLastMonths(6, now)
    for (const task of project.tasks) {
      for (const session of task.sessions) {
        session.start = getRandomDateWithinLastMonths(6, now)
        session.end = new Date(session.start.getTime() + getRandomSessionDuration())
      }
    }
  }

  user.visits = Array.from({ length: 100 }, () => ({
    id: crypto.randomUUID(),
    time: getRandomDateWithinLastMonths(8 * 12, now),
  }))

  const testThemes: Theme[] = ['default', 'sapphire', 'ruby', 'emerald', 'coral', 'amber', 'amethyst']
  user.settings.theme = testThemes[Math.floor(Math.random() * testThemes.length)] ?? 'default'
  user.isCurrentlyInTestMode = true

  applyColorTheme(user.settings.theme)
  saveUser(user)
  toast(`You can now test the application with the user "${user.username}".`)
}

export async function importUserFile(file: File) {
  try {
    const raw = JSON.parse(await file.text()) as RawData
    let data = raw

    if (isOutdatedData(raw)) {
      exportUserData()
      data = upgradeData({ ...raw, version: { major: 0, minor: 1, patch: 0 } })
      toast('We migrate your data to the latest version.')
    }

    const imported = parseUser(data)
    const auth = useAuthUser()
    const user = auth.value ? { ...imported, id: auth.value.did, isCurrentlyInTestMode: false } : imported

    applyColorTheme(user.settings.theme)
    saveUser(user)
    toast(`Data imported successfully for username "${user.username}".`)
  } catch (error) {
    console.error('[time-tracker] Failed to import the selected file.', error)
    toast('Error importing data. Please try again.')
  }
}

export function exportUserData() {
  const user = useTrackerUser().value
  if (!user) {
    toast('No data available to export.')
    return
  }

  try {
    downloadFile(serializeUser(user), JSON_EXPORT_FILENAME, 'application/json')
    toast('Data exported successfully.')
  } catch (error) {
    console.error('[time-tracker] Failed to export your data.', error)
    toast('Error exporting data. Please try again.')
  }
}

export function exportNow() {
  updateUser((draft) => {
    draft.settings.lastExported = new Date()
  })
  exportUserData()
}

export function downloadCsv(dateRange: DateRange) {
  const user = useTrackerUser().value
  if (!user) {
    toast('No data available to export.')
    return
  }

  try {
    downloadFile(convertToCsv(user, dateRange), getCsvFilename(dateRange), 'text/csv')
    toast('Data exported successfully.')
  } catch (error) {
    console.error('[time-tracker] Failed to export your data.', error)
    toast('Error exporting data. Please try again.')
  }
}

export function toggleTaskSession(taskId: string) {
  updateUser((draft) => {
    const context = findTaskContext(draft, taskId)
    if (!context) return
    const { project, task } = context

    if (isTaskRunning(task)) {
      for (const session of task.sessions) session.end ??= new Date()
      return
    }

    if (task.sessions.length === 0 && (task.status === 'backlog' || task.status === 'todo')) {
      const { projectStatusKickoff, taskStatusKickoff } = draft.settings.automation
      if (taskStatusKickoff) task.status = 'in progress'
      if (projectStatusKickoff) project.status = 'in progress'

      if (taskStatusKickoff && projectStatusKickoff)
        toast('We automatically moved your task and project to “In Progress”.')
      else if (taskStatusKickoff) toast('We automatically moved your task to “In Progress”.')
      else if (projectStatusKickoff) toast('We automatically moved your project to “In Progress”.')
    }

    task.sessions.push({ end: null, flow: 'good', id: crypto.randomUUID(), start: new Date() })
  })
}

export function addProject(project: Project) {
  updateUser((draft) => {
    draft.projects.push({ ...project, lastUpdatedAt: new Date() })
  })
}

export function updateProject(project: Project) {
  updateUser((draft) => {
    draft.projects = draft.projects.map((p) => (p.id === project.id ? { ...project, lastUpdatedAt: new Date() } : p))
  })
}

export function deleteProject(projectId: string) {
  updateUser((draft) => {
    draft.projects = draft.projects.filter((p) => p.id !== projectId)
  })
}

export function archiveProject(projectId: string) {
  updateUser((draft) => {
    const project = draft.projects.find((p) => p.id === projectId)
    if (!project) return

    const { archiveProjectStatusRetirement, archiveStopSessions, archiveTaskStatusRetirement } =
      draft.settings.automation
    project.archivedAt = new Date()

    if (archiveStopSessions) {
      for (const task of project.tasks) {
        for (const session of task.sessions) session.end ??= new Date()
      }
      toast('We automatically stopped all sessions running.')
    }

    if (archiveProjectStatusRetirement) {
      project.status = 'completed'
      toast('We automatically moved your project status to “Completed”.')
    }

    if (archiveTaskStatusRetirement) {
      for (const task of project.tasks) task.status = 'done'
      toast('We automatically moved every task of the project in “Done”.')
    }
  })
}

export function unarchiveProject(projectId: string) {
  updateUser((draft) => {
    const project = draft.projects.find((p) => p.id === projectId)
    if (project) project.archivedAt = null
  })
}

export function addTask(projectId: string, task: Task) {
  updateUser((draft) => {
    draft.projects.find((p) => p.id === projectId)?.tasks.push(task)
  })
}

export function updateTask(task: Task) {
  updateUser((draft) => {
    const context = findTaskContext(draft, task.id)
    if (!context) return
    context.project.tasks = context.project.tasks.map((t) => (t.id === task.id ? task : t))
  })
}

export function deleteTask(taskId: string) {
  updateUser((draft) => {
    for (const project of draft.projects) project.tasks = project.tasks.filter((t) => t.id !== taskId)
  })
}

export function addSession(taskId: string, session: Session) {
  updateUser((draft) => {
    findTaskContext(draft, taskId)?.task.sessions.push(session)
  })
}

export function updateSession(session: Session) {
  updateUser((draft) => {
    const context = findSessionContext(draft, session.id)
    if (!context) return
    context.task.sessions = context.task.sessions.map((s) => (s.id === session.id ? session : s))
  })
}

export function saveSessionToTask(session: Session, taskId: string) {
  updateUser((draft) => {
    const current = findSessionContext(draft, session.id)
    if (current?.task.id === taskId) {
      current.task.sessions = current.task.sessions.map((s) => (s.id === session.id ? session : s))
      return
    }

    if (current) current.task.sessions = current.task.sessions.filter((s) => s.id !== session.id)
    findTaskContext(draft, taskId)?.task.sessions.push(session)
  })
}

export function deleteSession(sessionId: string) {
  updateUser((draft) => {
    for (const task of getAllTasks(draft)) task.sessions = task.sessions.filter((s) => s.id !== sessionId)
  })
}

export function deleteAllProjects() {
  updateUser((draft) => {
    draft.projects = []
  })
  toast('All projects deleted successfully.')
}

export function setColorTheme(theme: Theme) {
  applyColorTheme(theme)
  updateUser((draft) => {
    draft.settings.theme = theme
  })
}

export function setUsername(username: string) {
  updateUser((draft) => {
    draft.username = username
  })
  toast(`You changed your username to "${username}".`)
}

export function setExportReminder(exportReminder: ExportReminder) {
  updateUser((draft) => {
    draft.settings.exportReminder = exportReminder
  })
  toast(`You changed your notification frequency to "${exportReminder}".`)
}

export function setAutomation(key: AutomationKey, enabled: boolean) {
  updateUser((draft) => {
    draft.settings.automation[key] = enabled
  })

  const setting = automationSettings.find((s) => s.key === key)
  if (setting) toast(enabled ? setting.toastActivate : setting.toastDeactivate)
}

export async function setProfilePicture(dataUrl: string) {
  try {
    await uploadProfilePicture(dataUrl)
  } catch (error) {
    console.error('[time-tracker] Failed to upload your profile picture.', error)
    toast('Your profile picture could not be uploaded. Please try again.')
    return
  }

  updateUser((draft) => {
    draft.profilePicture = dataUrl
  })
  toast('Profile picture updated successfully.')
}

export function removeProfilePicture() {
  clearProfilePictureBlob()
  updateUser((draft) => {
    draft.profilePicture = null
  })
  toast('Profile picture removed successfully.')
}

export async function clearAllData(message: string) {
  if (useAuthUser().value) {
    try {
      await deleteAccountData()
    } catch (error) {
      console.error('[time-tracker] Failed to delete your data from your ATproto repository.', error)
      toast('Your data could not be deleted from your account. Please try again.')
      return
    }
    toast(message)
    await signOut()
    return
  }

  removeLocalItem(LOCAL_DATA_KEY)
  applyColorTheme('default')
  useTrackerUser().value = null
  toast(message)
}

function getRandomDateWithinLastMonths(months: number, now: number) {
  const start = new Date(now)
  start.setMonth(start.getMonth() - months)
  return new Date(start.getTime() + Math.random() * (now - start.getTime()))
}

function getRandomSessionDuration() {
  const min = 5 * 60 * 1000
  const max = 5 * 60 * 60 * 1000
  return min + Math.random() * (max - min)
}
