import { describe, expect, it } from 'vitest'

function createEvent(id: string, start: string, end: string | null): CalendarEvent {
  return {
    color: 'red',
    end: end ? new Date(end) : null,
    flow: 'good',
    id,
    isReadOnly: false,
    projectName: 'Project',
    start: new Date(start),
    taskId: 'task',
    taskName: 'Task',
  }
}

describe('getViewRange', () => {
  it('starts weeks on Monday', () => {
    const { end, start } = getViewRange('week', new Date(2026, 8, 30))

    expect(start).toEqual(new Date(2026, 8, 28))
    expect(end.getDate()).toBe(4)
  })

  it('pads the month view to full weeks', () => {
    const weeks = getMonthWeeks(new Date(2026, 8, 15))

    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(weeks[0]![0]).toEqual(new Date(2026, 7, 31))
  })
})

describe('getDaySegments', () => {
  it('places overlapping sessions side by side', () => {
    const segments = getDaySegments(
      [
        createEvent('a', '2026-09-28T09:00:00', '2026-09-28T11:00:00'),
        createEvent('b', '2026-09-28T10:00:00', '2026-09-28T12:00:00'),
        createEvent('c', '2026-09-28T13:00:00', '2026-09-28T14:00:00'),
      ],
      new Date(2026, 8, 28),
    )

    expect(segments.map(({ column, columns, event }) => [event.id, column, columns])).toEqual([
      ['a', 0, 2],
      ['b', 1, 2],
      ['c', 0, 1],
    ])
  })

  it('clips sessions crossing midnight', () => {
    const [segment] = getDaySegments(
      [createEvent('a', '2026-09-27T22:00:00', '2026-09-28T02:00:00')],
      new Date(2026, 8, 28),
    )

    expect(segment).toMatchObject({ continuesBefore: true, endMinute: 120, startMinute: 0 })
  })

  it('draws running sessions until now', () => {
    const [segment] = getDaySegments(
      [createEvent('a', '2026-09-28T09:00:00', null)],
      new Date(2026, 8, 28),
      new Date('2026-09-28T10:30:00'),
    )

    expect(segment?.endMinute).toBe(630)
  })
})

describe('moveEvent', () => {
  it('keeps the duration', () => {
    const times = moveEvent(createEvent('a', '2026-09-28T09:00:00', '2026-09-28T10:00:00'), 90)

    expect(times).toEqual({ end: new Date('2026-09-28T11:30:00'), start: new Date('2026-09-28T10:30:00') })
  })
})

describe('resizeEvent', () => {
  it('keeps at least one snap step', () => {
    const times = resizeEvent(createEvent('a', '2026-09-28T09:00:00', '2026-09-28T10:00:00'), -120)

    expect(times.end).toEqual(new Date('2026-09-28T09:15:00'))
  })
})

describe('snapMinutes', () => {
  it('rounds to the nearest quarter hour', () => {
    expect(snapMinutes(7)).toBe(0)
    expect(snapMinutes(8)).toBe(15)
    expect(snapMinutes(-22)).toBe(-15)
  })
})
