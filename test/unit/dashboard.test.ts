import { describe, expect, it } from 'vitest'

import { createTestUser } from './utils'

describe('getRecentSessionsInfoText', () => {
  it('counts sessions without a date range', () => {
    expect(getRecentSessionsInfoText(createTestUser(), undefined)).toBe('You worked on 2 sessions.')
  })
})

describe('shouldShowExportNotification', () => {
  it('compares the last export with the reminder frequency', () => {
    const user = createTestUser()
    user.settings.lastExported = new Date('2026-01-01T00:00:00Z')
    user.settings.exportReminder = 'daily'

    expect(shouldShowExportNotification(user, new Date('2026-01-05T00:00:00Z'))).toBe(true)
    user.settings.exportReminder = 'monthly'
    expect(shouldShowExportNotification(user, new Date('2026-01-05T00:00:00Z'))).toBe(false)
  })
})

describe('getFlowRadarHelperText', () => {
  it('names the most common flow', () => {
    const series = getFlowRadarSeries(createTestUser(), undefined)

    expect(getFlowRadarHelperText(series)).toBe('Of 2 sessions, 50.00% are in "Smooth".')
  })
})

describe('getVisitsByYear', () => {
  it('shows the last ten years', () => {
    const chart = getVisitsByYear(createTestUser(), new Date('2026-06-01T00:00:00Z'))

    expect(chart.data.map((d) => d.label)).toEqual([
      '2017',
      '2018',
      '2019',
      '2020',
      '2021',
      '2022',
      '2023',
      '2024',
      '2025',
      '2026',
    ])
    expect(chart.current).toBe(1)
  })
})
