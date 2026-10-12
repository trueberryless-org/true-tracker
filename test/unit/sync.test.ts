import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createTestUser } from './utils'

describe('connectAccount', () => {
  beforeEach(() => {
    localStorage.clear()
    useTrackerUser().value = null
  })

  afterEach(() => {
    vi.useRealTimers()
    setAirspaceClient(null)
  })

  it('loads the remote data into the app', async () => {
    const remote = userToRecordSet({ ...createTestUser(), username: 'remote-name' })
    const identity = useSignedIn('did:plc:load')
    setAirspaceClient(createFakeAirspace(remote) as unknown as TrackerAirspace)

    await connectAccount(identity)

    expect(useTrackerUser().value?.username).toBe('remote-name')
    expect(useTrackerUser().value?.projects.map((project) => project.name)).toEqual(['Alpha'])
  })

  it('keeps the remote settings when the first load fails', async () => {
    vi.useFakeTimers()
    const remote = userToRecordSet({ ...createTestUser(), username: 'remote-name' })
    const identity = useSignedIn('did:plc:retry')
    setAirspaceClient(createFakeAirspace(remote, { failingLoads: 1 }) as unknown as TrackerAirspace)

    await connectAccount(identity)
    expect(useSyncState().status.value).toBe('failed')

    await vi.advanceTimersByTimeAsync(5000)

    expect(remote.settings.self?.username).toBe('remote-name')
    expect(useTrackerUser().value?.username).toBe('remote-name')
    expect(useTrackerUser().value?.projects.map((project) => project.name)).toEqual(['Alpha'])
  })

  it('keeps changes made while the remote data is loading', async () => {
    const remote = userToRecordSet({ ...createTestUser(), username: 'remote-name' })
    const identity = useSignedIn('did:plc:race')
    let releaseLoad!: () => void
    const loadGate = new Promise<void>((resolve) => (releaseLoad = resolve))
    writeLocalJson(getAccountDataKey(identity.did), {
      synced: remote,
      user: { ...createTestUser(), id: identity.did, username: 'remote-name' },
    })
    showCachedAccount(identity.did)
    setAirspaceClient(createFakeAirspace(remote, { loadGate }) as unknown as TrackerAirspace)

    const connecting = connectAccount(identity)
    await Promise.resolve()
    updateUser((draft) => {
      draft.projects.push({ ...createProject(), id: 'project-new', name: 'Added while loading' })
    })
    releaseLoad()
    await connecting

    expect(useTrackerUser().value?.projects.map((project) => project.name)).toContain('Added while loading')
    expect(remote.project['project-new']).toMatchObject({ name: 'Added while loading' })
  })
})

describe('refreshFromRemote', () => {
  afterEach(() => {
    vi.useRealTimers()
    setAirspaceClient(null)
  })

  it('picks up changes made on another device', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    localStorage.clear()
    useTrackerUser().value = null
    const remote = userToRecordSet({ ...createTestUser(), username: 'remote-name' })
    const identity = useSignedIn('did:plc:refresh')
    setAirspaceClient(createFakeAirspace(remote) as unknown as TrackerAirspace)
    await connectAccount(identity)

    remote.project['project-other'] = { name: 'From another device', position: 5, priority: 'low', status: 'planned' }
    vi.advanceTimersByTime(2 * 60 * 1000)
    await refreshFromRemote(identity)

    expect(useTrackerUser().value?.projects.map((project) => project.name)).toContain('From another device')
    expect(useTrackerUser().value?.projects.map((project) => project.name)).toContain('Alpha')
  })
})

describe('adoptAccountCacheFromOtherTab', () => {
  it('shows the data another tab stored', () => {
    const identity = useSignedIn('did:plc:tabs')
    writeLocalJson(getAccountDataKey(identity.did), {
      synced: createEmptyRecordSet(),
      user: { ...createTestUser(), id: identity.did, username: 'other-tab' },
    })

    adoptAccountCacheFromOtherTab(identity.did)

    expect(useTrackerUser().value?.username).toBe('other-tab')
  })
})

function useSignedIn(did: string): AuthUser {
  const identity = { did, handle: 'tester.test' }
  useAuthUser().value = identity
  return identity
}

function createFakeAirspace(remote: RecordSet, options: FakeAirspaceOptions = {}) {
  let failingLoads = options.failingLoads ?? 0

  function createCollection(name: Exclude<RecordCollection, 'settings'>) {
    return {
      list: async () => {
        await options.loadGate
        if (name === 'project' && failingLoads > 0) {
          failingLoads--
          throw new Error('The network is unreachable.')
        }
        return Object.entries(remote[name]).map(([rkey, value]) => ({ rkey, value: { ...value } }))
      },
    }
  }

  const builder = new Proxy(
    {},
    {
      get: (_, collection: RecordCollection) =>
        collection === 'settings'
          ? {
              delete: () => delete remote.settings.self,
              put: (value: RecordValue) => (remote.settings.self = value),
            }
          : {
              delete: (rkey: string) => delete remote[collection][rkey],
              put: (rkey: string, value: RecordValue) => (remote[collection][rkey] = value),
            },
    },
  )

  return {
    blobs: { upload: async () => ({ blob: {} }), url: async () => null },
    identity: async () => ({ did: 'did:plc:fake', handle: 'tester.test', service: 'https://pds.test' }),
    vault: {
      batch: async (build: (value: unknown) => void) => build(builder),
      blobs: { url: async () => null },
      manage: { ensure: async () => ({}) },
      project: createCollection('project'),
      session: createCollection('session'),
      settings: { get: async () => (remote.settings.self ? { value: { ...remote.settings.self } } : null) },
      supported: async () => true,
      task: createCollection('task'),
      visit: createCollection('visit'),
    },
  }
}

interface FakeAirspaceOptions {
  failingLoads?: number
  loadGate?: Promise<void>
}
