import { describe, expect, it } from 'vitest'

describe('getNiceTicks', () => {
  it('rounds the maximum up to a nice step', () => {
    expect(getNiceTicks(19)).toEqual([0, 5, 10, 15, 20])
    expect(getNiceTicks(37)).toEqual([0, 10, 20, 30, 40])
    expect(getNiceTicks(0)).toEqual([0, 1, 2, 3, 4])
  })
})

describe('getDonutSectors', () => {
  it('starts at the top and goes clockwise', () => {
    const sectors = getDonutSectors([1, 1], { cx: 0, cy: 0, innerRadius: 1, outerRadius: 2 })

    expect(sectors.map(({ endAngle, startAngle }) => [startAngle, endAngle])).toEqual([
      [90, -90],
      [-90, -270],
    ])
  })

  it('returns nothing without values', () => {
    expect(getDonutSectors([0, 0], { cx: 0, cy: 0, innerRadius: 1, outerRadius: 2 })).toEqual([])
  })
})
