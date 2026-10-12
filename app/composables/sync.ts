import { cidFromBlob, ScopeError, ValidationError } from 'airspace'
import type { OAuthSession } from 'airspace/oauth/browser'
import { toast } from 'vue-sonner'

const BATCH_SIZE = 100
const MIN_RETRY_MS = 5000
const MAX_RETRY_MS = 5 * 60 * 1000
const PUBLIC_OPT_IN_PREFIX = 'time-tracker-public-opt-in:'
const SPACE_SCOPE_PREFIX = 'space:'
const SCOPE_MESSAGE_RE = /scope|space declaration|retrieve space|not authorized|forbidden/i
const SESSION_MESSAGE_RE = /invalid_grant|token.*(expired|revoked)|session.*(expired|revoked|deleted)|401/i

let syncedRecords: RecordSet = createEmptyRecordSet()
let profilePictureBlob: unknown
let oauthSession: OAuthSession | null = null
let flushing: Promise<void> | null = null
let hasPendingFlush = false
let isRemoteLoaded = false
let visitRecordedFor: string | null = null
let placeholderFor: string | null = null
let retryTimer: ReturnType<typeof setTimeout> | undefined
let retryDelay = MIN_RETRY_MS

export function useSyncState() {
  const target = useState<SyncTarget>('time-tracker-sync-target', () => 'none')
  const status = useState<SyncStatus>('time-tracker-sync-status', () => 'idle')
  const spaceAccess = useState<SpaceAccess>('time-tracker-space-access', () => 'unknown')
  const lastError = useState<string | null>('time-tracker-sync-error', () => null)
  return { lastError, spaceAccess, status, target }
}

export function setOAuthSession(session: OAuthSession | null) {
  oauthSession = session
}

export function isPublicStorageOptedIn(did: string): boolean {
  try {
    return localStorage.getItem(`${PUBLIC_OPT_IN_PREFIX}${did}`) === 'true'
  } catch {
    return false
  }
}

export async function connectAccount(identity: AuthUser): Promise<void> {
  const airspace = useAirspace()
  if (!airspace) return

  const { lastError, spaceAccess, target } = useSyncState()
  isRemoteLoaded = false
  const cache = readAccountCache(identity.did)
  const handle = identity.handle ?? (await airspace.identity().catch(() => null))?.handle ?? identity.did

  if (cache) showAccountUser(cache.user)

  spaceAccess.value = await resolveSpaceAccess(airspace)
  if (spaceAccess.value === 'granted') {
    try {
      await airspace.vault.manage.ensure()
      target.value = 'vault'
    } catch (error) {
      console.error('[time-tracker] Failed to configure the private space.', error)
      spaceAccess.value = 'denied'
      lastError.value = describeError(error)
    }
  }
  if (spaceAccess.value !== 'granted') target.value = isPublicStorageOptedIn(identity.did) ? 'public' : 'device'

  if (target.value === 'device') {
    syncedRecords = cache?.synced ?? createEmptyRecordSet()
    profilePictureBlob = cache?.profilePictureBlob
    showAccountUser(withVisit(cache?.user ?? migrateGuestOrCreate(identity.did, handle)))
    persistAccountCache()
    return
  }

  await loadRemote(identity, handle, cache)
}

export function showCachedAccount(did: string) {
  const cache = readAccountCache(did)
  if (!cache) return

  syncedRecords = cache.synced
  profilePictureBlob = cache.profilePictureBlob
  showAccountUser(cache.user)
}

export function scheduleSync() {
  persistAccountCache()
  void flushChanges()
}

export async function flushChanges(): Promise<void> {
  if (flushing) {
    hasPendingFlush = true
    return flushing
  }

  flushing = runFlush().finally(() => {
    flushing = null
    if (!hasPendingFlush) return
    hasPendingFlush = false
    void flushChanges()
  })
  return flushing
}

export async function enablePublicStorage(did: string) {
  try {
    localStorage.setItem(`${PUBLIC_OPT_IN_PREFIX}${did}`, 'true')
  } catch {}

  const { target } = useSyncState()
  const auth = useAuthUser()
  const user = useTrackerUser()
  target.value = 'public'

  if (!auth.value || !user.value) return
  syncedRecords = createEmptyRecordSet()
  isRemoteLoaded = false
  await loadRemote(auth.value, auth.value.handle ?? auth.value.did, {
    profilePictureBlob,
    synced: createEmptyRecordSet(),
    user: user.value,
  })
}

export async function disablePublicStorage(did: string) {
  const airspace = useAirspace()
  const { lastError, status, target } = useSyncState()
  if (!airspace) return

  status.value = 'syncing'
  try {
    const remote = await fetchRecordSet(airspace, 'public')
    await writeInChunks(airspace, 'public', diffRecordSets(remote, createEmptyRecordSet()))
  } catch (error) {
    console.error('[time-tracker] Failed to delete your public records.', error)
    status.value = 'failed'
    lastError.value = describeError(error)
    throw error
  }

  try {
    localStorage.removeItem(`${PUBLIC_OPT_IN_PREFIX}${did}`)
  } catch {}

  syncedRecords = createEmptyRecordSet()
  target.value = 'device'
  status.value = 'idle'
  lastError.value = null
  persistAccountCache()
}

export async function uploadProfilePicture(dataUrl: string): Promise<void> {
  const airspace = useAirspace()
  const { target } = useSyncState()
  if (!airspace || (target.value !== 'vault' && target.value !== 'public')) return

  const blob = await (await fetch(dataUrl)).blob()
  profilePictureBlob = (await airspace.blobs.upload(blob, { mimeType: blob.type })).blob
}

export function clearProfilePictureBlob() {
  profilePictureBlob = undefined
}

export async function deleteAccountData(): Promise<void> {
  const airspace = useAirspace()
  const { target } = useSyncState()
  const user = useAuthUser()

  if (airspace && (target.value === 'vault' || target.value === 'public')) {
    const remote = await fetchRecordSet(airspace, target.value)
    await writeInChunks(airspace, target.value, diffRecordSets(remote, createEmptyRecordSet()))
    if (target.value === 'vault' && (await airspace.vault.manage.exists().catch(() => false))) {
      await airspace.vault.manage.delete()
    }
  }

  if (user.value) removeLocalItem(getAccountDataKey(user.value.did))
}

async function loadRemote(identity: AuthUser, handle: string, cache: AccountCache | null) {
  const airspace = useAirspace()
  const { lastError, status, target } = useSyncState()
  if (!airspace || (target.value !== 'vault' && target.value !== 'public')) return

  clearTimeout(retryTimer)
  status.value = 'syncing'
  try {
    const remote = await fetchRecordSet(airspace, target.value)
    const current = useTrackerUser().value
    const local = current?.id === identity.did ? current : (cache?.user ?? null)

    if (isRecordSetEmpty(remote) && !local) {
      syncedRecords = remote
      showAccountUser(withVisit(migrateGuestOrCreate(identity.did, handle)))
    } else {
      const base = cache?.synced ?? createEmptyRecordSet()
      const isPlaceholder = placeholderFor === identity.did
      const localChanges = (local ? diffRecordSets(base, userToRecordSet(local, profilePictureBlob)) : []).filter(
        (operation) => !isPlaceholder || operation.collection !== 'settings',
      )
      const merged = applyRecordOperations(remote, localChanges)
      const previousBlob = profilePictureBlob
      syncedRecords = remote
      profilePictureBlob = merged.settings[SETTINGS_RKEY]?.profilePicture
      const profilePicture = await resolveProfilePicture(profilePictureBlob, previousBlob, local)
      showAccountUser(withVisit(recordSetToUser(merged, { did: identity.did, handle, profilePicture })))
    }

    isRemoteLoaded = true
    placeholderFor = null
    status.value = 'idle'
    lastError.value = null
    retryDelay = MIN_RETRY_MS
    persistAccountCache()
    await flushChanges()
  } catch (error) {
    console.error('[time-tracker] Failed to load your data from your ATproto repository.', error)
    status.value = 'failed'
    lastError.value = describeError(error)
    if (!useTrackerUser().value) {
      if (!cache) placeholderFor = identity.did
      showAccountUser(withVisit(cache?.user ?? createAccountUser(identity.did, handle)))
    }
    handleSyncFailure(error, () => loadRemote(identity, handle, readAccountCache(identity.did) ?? cache))
  }
}

async function runFlush() {
  const airspace = useAirspace()
  const { lastError, status, target } = useSyncState()
  const user = useTrackerUser()
  if (!airspace || !user.value || !isRemoteLoaded || (target.value !== 'vault' && target.value !== 'public')) return

  if (!navigator.onLine) {
    status.value = 'offline'
    return
  }

  clearTimeout(retryTimer)
  status.value = 'syncing'

  try {
    const operations = diffRecordSets(syncedRecords, userToRecordSet(user.value, profilePictureBlob))
    await writeInChunks(airspace, target.value, operations, (chunk) => {
      syncedRecords = applyRecordOperations(syncedRecords, chunk)
      persistAccountCache()
    })
    status.value = 'idle'
    lastError.value = null
    retryDelay = MIN_RETRY_MS
  } catch (error) {
    console.error('[time-tracker] Failed to save your changes to your ATproto repository.', error)
    status.value = 'failed'
    lastError.value = describeError(error)
    handleSyncFailure(error, flushChanges)
  }
}

function handleSyncFailure(error: unknown, retry: () => Promise<void>) {
  const { lastError, spaceAccess, target } = useSyncState()

  if (target.value === 'vault' && isScopeProblem(error)) {
    spaceAccess.value = 'denied'
    target.value = 'device'
    isRemoteLoaded = false
    persistAccountCache()
    toast('Your account did not grant access to the private space. Your data stays on this device for now.')
    return
  }

  if (error instanceof ValidationError) {
    const issues = error.issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')
    lastError.value = `Some data does not fit the record format (${issues}). Shorten it and try again.`
    return
  }

  if (SESSION_MESSAGE_RE.test(describeError(error))) {
    lastError.value = 'Your ATproto session expired. Sign out and sign in again to keep saving to your account.'
    return
  }

  scheduleRetry(retry)
}

async function writeInChunks(
  airspace: TrackerAirspace,
  target: 'vault' | 'public',
  operations: RecordOperation[],
  onChunkWritten?: (chunk: RecordOperation[]) => void,
) {
  for (let index = 0; index < operations.length; index += BATCH_SIZE) {
    const chunk = operations.slice(index, index + BATCH_SIZE)
    await writeOperations(airspace, target, chunk)
    onChunkWritten?.(chunk)
  }
}

async function writeOperations(airspace: TrackerAirspace, target: 'vault' | 'public', operations: RecordOperation[]) {
  if (operations.length === 0) return

  const build = (builder: Parameters<Parameters<TrackerAirspace['batch']>[0]>[0]) => {
    for (const operation of operations) {
      if (operation.collection === 'settings') {
        if (operation.type === 'put') builder.settings.put(operation.value as never)
        else builder.settings.delete()
        continue
      }

      const collection = builder[operation.collection] as unknown as KeyedBatchCollection
      if (operation.type === 'put') collection.put(operation.rkey, operation.value)
      else collection.delete(operation.rkey)
    }
  }

  if (target === 'vault') await airspace.vault.batch(build as never)
  else await airspace.batch(build)
}

async function fetchRecordSet(airspace: TrackerAirspace, target: 'vault' | 'public'): Promise<RecordSet> {
  const source = target === 'vault' ? airspace.vault : airspace
  const [projects, tasks, sessions, visits, settings] = await Promise.all([
    source.project.list(),
    source.task.list(),
    source.session.list(),
    source.visit.list(),
    source.settings.get(),
  ])

  const records = createEmptyRecordSet()
  for (const record of projects) records.project[record.rkey] = { ...record.value }
  for (const record of tasks) records.task[record.rkey] = { ...record.value }
  for (const record of sessions) records.session[record.rkey] = { ...record.value }
  for (const record of visits) records.visit[record.rkey] = { ...record.value }
  if (settings) records.settings[SETTINGS_RKEY] = { ...settings.value }

  for (const collection of RECORD_COLLECTIONS) {
    for (const value of Object.values(records[collection])) delete value.$type
  }

  return records
}

async function resolveSpaceAccess(airspace: TrackerAirspace): Promise<SpaceAccess> {
  const supported = await airspace.vault.supported().catch(() => false)
  if (!supported) return 'unsupported'

  const scope = await oauthSession
    ?.getTokenInfo(false)
    .then((info) => String(info.scope))
    .catch(() => '')
  if (scope !== undefined && !scope.split(' ').some((part) => part.startsWith(SPACE_SCOPE_PREFIX))) return 'denied'

  return 'granted'
}

async function resolveProfilePicture(blob: unknown, previousBlob: unknown, local: User | null): Promise<string | null> {
  if (!blob) return null
  if (local?.profilePicture && cidFromBlob(previousBlob) === cidFromBlob(blob)) return local.profilePicture

  const airspace = useAirspace()
  const { target } = useSyncState()
  if (!airspace) return null

  try {
    const url = target.value === 'vault' ? await airspace.vault.blobs.url(blob) : await airspace.blobs.url(blob)
    if (!url) return null
    if (target.value === 'public' || !oauthSession) return url

    const parsed = new URL(url)
    const response = await oauthSession.fetchHandler(`${parsed.pathname}${parsed.search}`)
    if (!response.ok) return null
    return await blobToDataUrl(await response.blob())
  } catch (error) {
    console.error('[time-tracker] Failed to load your profile picture.', error)
    return null
  }
}

function withVisit(user: User): User {
  if (visitRecordedFor === user.id) return user
  visitRecordedFor = user.id
  return addVisit(user)
}

function showAccountUser(user: User) {
  useTrackerUser().value = user
  useTrackerLoaded().value = true
  applyColorTheme(user.settings.theme)
}

function migrateGuestOrCreate(did: string, handle: string): User {
  const guest = readGuestUserForMigration()
  if (!guest) return createAccountUser(did, handle)

  toast('We copied the data from this device to your account.')
  return { ...guest, id: did }
}

function createAccountUser(did: string, handle: string): User {
  return { ...createUser(handle), id: did }
}

function readGuestUserForMigration(): User | null {
  const raw = readLocalJson(LOCAL_DATA_KEY) as RawData | null
  if (!raw || raw.isCurrentlyInTestMode) return null

  try {
    return parseUser(isOutdatedData(raw) ? upgradeData(raw) : raw)
  } catch {
    return null
  }
}

function readAccountCache(did: string): AccountCache | null {
  const raw = readLocalJson(getAccountDataKey(did)) as StoredAccountCache | null
  if (!raw?.user) return null

  try {
    return { profilePictureBlob: raw.profilePictureBlob, synced: raw.synced, user: parseUser(raw.user) }
  } catch {
    return null
  }
}

function persistAccountCache() {
  const auth = useAuthUser()
  const user = useTrackerUser()
  if (!auth.value || !user.value) return

  writeLocalJson(getAccountDataKey(auth.value.did), {
    profilePictureBlob,
    synced: syncedRecords,
    user: user.value,
  } satisfies StoredAccountCache)
}

function scheduleRetry(retry: () => Promise<void>) {
  clearTimeout(retryTimer)
  retryTimer = setTimeout(() => void retry(), retryDelay)
  retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS)
}

function isScopeProblem(error: unknown) {
  return error instanceof ScopeError || SCOPE_MESSAGE_RE.test(describeError(error))
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    const cause = error.cause instanceof Error ? ` (${error.cause.message})` : ''
    return `${error.message}${cause}`
  }
  return String(error)
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)))
    reader.addEventListener('error', () => reject(reader.error))
    reader.readAsDataURL(blob)
  })
}

export type SyncTarget = 'none' | 'vault' | 'public' | 'device'
export type SyncStatus = 'idle' | 'syncing' | 'failed' | 'offline'
export type SpaceAccess = 'unknown' | 'granted' | 'denied' | 'unsupported'

interface KeyedBatchCollection {
  delete: (rkey: string) => void
  put: (rkey: string, value: unknown) => void
}

interface AccountCache {
  profilePictureBlob: unknown
  synced: RecordSet
  user: User
}

interface StoredAccountCache {
  profilePictureBlob: unknown
  synced: RecordSet
  user: unknown
}
