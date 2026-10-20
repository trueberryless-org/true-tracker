import { describe, expect, it } from 'vitest'

describe('convert12HourTo24Hour', () => {
  it('handles noon and midnight', () => {
    expect(convert12HourTo24Hour(12, 'AM')).toBe(0)
    expect(convert12HourTo24Hour(12, 'PM')).toBe(12)
    expect(convert12HourTo24Hour(1, 'PM')).toBe(13)
  })
})

describe('getArrowByType', () => {
  it('loops at the bounds', () => {
    expect(getArrowByType('59', 1, 'minutes')).toBe('00')
    expect(getArrowByType('00', -1, 'hours')).toBe('23')
    expect(getArrowByType('12', 1, '12hours')).toBe('01')
  })
})

describe('getPeriod', () => {
  it('derives the period from the hours', () => {
    expect(getPeriod(new Date(2026, 0, 1, 9))).toBe('AM')
    expect(getPeriod(new Date(2026, 0, 1, 12))).toBe('PM')
  })
})
