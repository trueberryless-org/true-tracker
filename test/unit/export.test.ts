import { describe, expect, it } from 'vitest'

import { createTestUser } from './utils'

describe('convertToCsv', () => {
  it('escapes values and filters by start date', () => {
    const csv = convertToCsv(createTestUser(), {
      from: new Date('2026-01-05T00:00:00'),
      to: new Date('2026-01-05T00:00:00'),
    })
    const lines = csv.split('\n')

    expect(lines).toHaveLength(2)
    expect(lines[1]).toContain('"Build it, with commas"')
    expect(lines[1]).toContain('60.00,3600.00,1.00,01:00:00')
  })
})
