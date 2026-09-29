import type { Airspace } from 'airspace'
import type { BrowserOAuth } from 'airspace/oauth/browser'

import type { collections, spaces } from '~~/shared/atproto/collections'

export type TrackerAirspace = Airspace<typeof collections, typeof spaces>

export const SIGNIN_HANDLE_KEY = 'time-tracker-signin-handle'
export const SIGNIN_RETRY_KEY = 'time-tracker-signin-retried'

const IDENTITY_KEY = 'time-tracker-identity'

let resolveAuthReady!: () => void
export const authReady: Promise<void> = new Promise((resolve) => {
  resolveAuthReady = resolve
})

let oauthClient: BrowserOAuth | null = null
let airspaceClient: TrackerAirspace | null = null

export function markAuthReady() {
  resolveAuthReady()
}

export function setOAuthClient(client: BrowserOAuth | null) {
  oauthClient = client
}

export function setAirspaceClient(client: TrackerAirspace | null) {
  airspaceClient = client
}

export function useOAuth(): BrowserOAuth | null {
  return oauthClient
}

export function useAirspace(): TrackerAirspace | null {
  return airspaceClient
}

export function useAuthUser() {
  return useState<AuthUser | null>('time-tracker-auth', () => null)
}

export function useConnected() {
  return useState('time-tracker-connected', () => false)
}

export function useHydrated() {
  return useState('time-tracker-hydrated', () => false)
}

export function rememberedIdentity(): AuthUser | null {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY)
    const parsed = raw ? (JSON.parse(raw) as Partial<AuthUser>) : null
    return parsed?.did ? { did: parsed.did, handle: parsed.handle ?? null } : null
  } catch {
    return null
  }
}

export function rememberIdentity(user: AuthUser | null) {
  try {
    if (user) localStorage.setItem(IDENTITY_KEY, JSON.stringify(user))
    else localStorage.removeItem(IDENTITY_KEY)
  } catch {}
}

export async function signInWithAtproto(identifier: string) {
  await Promise.race([authReady, new Promise((resolve) => setTimeout(resolve, 10_000))])

  const oauth = useOAuth()
  if (!oauth) throw new Error('The ATproto sign-in is not available right now. Please reload the page and try again.')

  try {
    sessionStorage.setItem(SIGNIN_HANDLE_KEY, identifier)
  } catch {}

  await oauth.signIn(identifier)
}

export async function signOut() {
  const user = useAuthUser()

  try {
    if (oauthClient && user.value) await oauthClient.revoke(user.value.did)
  } catch (error) {
    console.error('[time-tracker] Failed to revoke the ATproto session.', error)
  }

  rememberIdentity(null)
  window.location.href = '/'
}

export interface AuthUser {
  did: string
  handle: string | null
}
