import { describe, expect, it } from 'vitest'

import { createTestUser } from './utils'

describe('userToRecordSet', () => {
  it('flattens the nested user into records keyed by identifier', () => {
    const records = userToRecordSet(createTestUser())

    expect(Object.keys(records.project)).toEqual(['project-a'])
    expect(records.task['task-a']).toMatchObject({ position: 0, project: 'project-a' })
    expect(records.session['session-b']).toEqual({
      flow: 'good',
      position: 1,
      start: '2026-01-06T09:00:00.000Z',
      task: 'task-a',
    })
    expect(records.settings.self).toMatchObject({ theme: 'default', username: 'tester' })
  })
})

describe('recordSetToUser', () => {
  it('restores the user from its records', () => {
    const user = createTestUser()
    const restored = recordSetToUser(userToRecordSet(user), { did: 'user', handle: 'tester.bsky.social' })

    expect(restored.projects).toEqual(user.projects)
    expect(restored.visits).toEqual(user.visits)
    expect(restored.username).toBe('tester')
  })

  it('falls back to the handle without a settings record', () => {
    const records = createEmptyRecordSet()

    expect(recordSetToUser(records, { did: 'did:plc:a', handle: 'alice.test' }).username).toBe('alice.test')
  })
})

describe('diffRecordSets', () => {
  it('returns puts for new or changed records and deletes for removed ones', () => {
    const before = userToRecordSet(createTestUser())
    const user = createTestUser()
    user.projects[0]!.name = 'Renamed'
    user.projects[0]!.tasks.pop()
    const after = userToRecordSet(user)

    expect(diffRecordSets(before, after)).toEqual([
      { collection: 'project', rkey: 'project-a', type: 'put', value: after.project['project-a'] },
      { collection: 'task', rkey: 'task-b', type: 'delete' },
    ])
  })

  it('ignores key order', () => {
    const before = createEmptyRecordSet()
    before.visit.a = { b: 1, time: 'x' }
    const after = createEmptyRecordSet()
    after.visit.a = { time: 'x', b: 1 }

    expect(diffRecordSets(before, after)).toEqual([])
  })
})

describe('applyRecordOperations', () => {
  it('applies the operations without mutating the input', () => {
    const records = createEmptyRecordSet()
    const result = applyRecordOperations(records, [
      { collection: 'visit', rkey: 'a', type: 'put', value: { time: 'x' } },
    ])

    expect(result.visit.a).toEqual({ time: 'x' })
    expect(records.visit).toEqual({})
  })
})
