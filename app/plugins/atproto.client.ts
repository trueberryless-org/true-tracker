import { createAirspace } from 'airspace'
import { createBrowserOAuth } from 'airspace/oauth/browser'

import { collections, spaces } from '~~/shared/atproto/collections'
import { clientMetadataOptions, fallbackScopes } from '~~/shared/atproto/oauth'

const OAUTH_CALLBACK_RE = /[#&?](code|state|iss|error)=/
const SCOPE_ERROR_RE = /scope|space declaration|retrieve space/i
const RECONNECT_MS = 30 * 1000

export default defineNuxtPlugin(() => {
  if (import.meta.test) return

  const authUser = useAuthUser()
  const connected = useConnected()
  const online = useOnline()
  const origin = window.location.origin
  const remembered = rememberedIdentity()
  const isOAuthCallback = OAUTH_CALLBACK_RE.test(window.location.hash) || OAUTH_CALLBACK_RE.test(window.location.search)
  let oauth: Awaited<ReturnType<typeof createBrowserOAuth>> | null = null
  let retryTimer: ReturnType<typeof setTimeout> | undefined

  if (remembered) {
    authUser.value = remembered
    showCachedAccount(remembered.did)
  } else if (!isOAuthCallback) {
    loadGuestUser()
  }

  watch(online, (isOnline) => {
    if (isOnline && remembered && !connected.value) void connect()
    if (isOnline && connected.value) void flushChanges()
  })

  void connect().finally(markAuthReady)

  async function connect(): Promise<void> {
    try {
      oauth ??= await createBrowserOAuth({ ...clientMetadataOptions(origin), allowHttp: origin.startsWith('http://') })
      setOAuthClient(oauth)
    } catch (error) {
      console.error('[time-tracker] Failed to initialize the ATproto OAuth client.', error)
      finishWithoutSession()
      return
    }

    try {
      const result = await oauth.init()
      if (!result) {
        if (remembered && !online.value) return
        rememberIdentity(null)
        authUser.value = null
        useTrackerUser().value = null
        loadGuestUser()
        return
      }

      setAirspaceClient(createAirspace({ collections, identity: result.did, session: result.session, spaces }))
      setOAuthSession(result.session)
      const handle = remembered?.did === result.did ? remembered.handle : null
      authUser.value = { did: result.did, handle }
      connected.value = true
      safeRemoveSessionItem(SIGNIN_HANDLE_KEY)
      safeRemoveSessionItem(SIGNIN_RETRY_KEY)

      if (result.state && window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search)
      }

      const airspace = useAirspace()
      const identity = await airspace?.identity().catch(() => null)
      authUser.value = { did: result.did, handle: identity?.handle ?? handle }
      rememberIdentity(authUser.value)

      await connectAccount(authUser.value)
    } catch (error) {
      const handle = readSessionValue(SIGNIN_HANDLE_KEY)
      if (handle && !readSessionValue(SIGNIN_RETRY_KEY) && SCOPE_ERROR_RE.test(String((error as Error)?.message))) {
        writeSessionValue(SIGNIN_RETRY_KEY, '1')
        try {
          await oauth.signIn(handle, { scopes: fallbackScopes })
          return
        } catch (retryError) {
          console.error('[time-tracker] The sign-in with the fallback scopes failed.', retryError)
        }
      }

      safeRemoveSessionItem(SIGNIN_HANDLE_KEY)
      safeRemoveSessionItem(SIGNIN_RETRY_KEY)
      console.error('[time-tracker] Failed to restore the ATproto session.', error)
      if (remembered) {
        clearTimeout(retryTimer)
        retryTimer = setTimeout(() => void connect(), RECONNECT_MS)
        return
      }
      finishWithoutSession()
    }
  }

  function finishWithoutSession() {
    if (remembered) return
    if (!useTrackerLoaded().value) loadGuestUser()
  }
})

function safeRemoveSessionItem(key: string) {
  try {
    sessionStorage.removeItem(key)
  } catch {}
}
