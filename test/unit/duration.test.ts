import { describe, expect, it } from 'vitest'

describe('formatDurationLong', () => {
  it('lists the non-zero components', () => {
    expect(formatDurationLong(0)).toBe('0 seconds')
    expect(formatDurationLong(1000)).toBe('1 second')
    expect(formatDurationLong(3_661_000)).toBe('1 hour, 1 minute, 1 second')
    expect(formatDurationLong(7_200_000)).toBe('2 hours')
  })
})

describe('formatDurationShort', () => {
  it('uses short units', () => {
    expect(formatDurationShort(0)).toBe('0s')
    expect(formatDurationShort(3_723_000)).toBe('1h 2m 3s')
  })
})

describe('formatDurationFitting', () => {
  it('picks the largest unit', () => {
    expect(formatDurationFitting(59_000)).toBe('59s')
    expect(formatDurationFitting(3_600_000)).toBe('1h')
    expect(formatDurationFitting(172_800_000)).toBe('2d')
  })
})

describe('formatElapsedSeconds', () => {
  it('omits empty leading units', () => {
    expect(formatElapsedSeconds(5)).toBe('5s')
    expect(formatElapsedSeconds(3725)).toBe('1h 2m 5s')
  })
})
