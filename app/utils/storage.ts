export const LOCAL_DATA_KEY = 'timeTrackerData'
export const COLOR_THEME_KEY = 'time-tracker-color-theme'

export function getAccountDataKey(did: string): string {
  return `time-tracker:${did}`
}

export function readLocalJson(key: string): unknown {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function writeLocalJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('[time-tracker] Failed to write to local storage.', error)
  }
}

export function removeLocalItem(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {}
}

export function readSessionFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

export function writeSessionValue(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value)
  } catch {}
}

export function readSessionValue(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}
