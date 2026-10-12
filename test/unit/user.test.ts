import { describe, expect, it } from 'vitest'

describe('upgradeData', () => {
  it('upgrades 0.1.0 data to the current version', () => {
    const data = upgradeData({
      projects: [{ tasks: [{ sessions: [{ end: null, start: '2024-01-01T00:00:00Z' }] }] }],
      theme: 'ruby',
      version: { major: 0, minor: 1, patch: 0 },
    })

    expect(data.version).toEqual(DATA_VERSION)
    expect(data).toMatchObject({ settings: { exportReminder: 'weekly', theme: 'ruby' }, visits: [] })
    expect(data.theme).toBeUndefined()
  })

  it('throws for unknown versions', () => {
    expect(() => upgradeData({ version: { major: 9, minor: 9, patch: 9 } })).toThrowError(/No upgrade path/)
  })
})

describe('parseUser', () => {
  it('turns date strings into dates', () => {
    const user = parseUser(JSON.parse(JSON.stringify(createUser('tester'))))

    expect(user.settings.lastExported).toBeInstanceOf(Date)
  })
})

describe('validateUsername', () => {
  it('requires two characters', () => {
    expect(validateUsername('a')).toBe('Username must be at least 2 characters.')
    expect(validateUsername('ab')).toBeNull()
  })
})
