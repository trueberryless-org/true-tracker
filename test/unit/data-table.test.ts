import { describe, expect, it } from 'vitest'

interface Row {
  id: string
  name: string
  status: string
}

const columns: TableColumn<Row>[] = [
  { accessor: (row) => row.name, breakpoints: ['mobile', 'xl'], id: 'name' },
  { accessor: (row) => row.status, breakpoints: ['xl'], id: 'status', order: { xl: -1 } },
]
const rows: Row[] = [
  { id: '1', name: 'Beta', status: 'done' },
  { id: '2', name: 'alpha', status: 'todo' },
  { id: '3', name: 'Gamma', status: 'done' },
]

describe('filterRows', () => {
  it('matches text case-insensitively and lists by inclusion', () => {
    expect(filterRows(rows, columns, { name: 'A' }).map((r) => r.id)).toEqual(['1', '2', '3'])
    expect(filterRows(rows, columns, { name: 'gam', status: ['done'] }).map((r) => r.id)).toEqual(['3'])
  })
})

describe('sortRows', () => {
  it('sorts naturally in both directions', () => {
    expect(sortRows(rows, columns, { desc: false, id: 'name' }).map((r) => r.name)).toEqual(['alpha', 'Beta', 'Gamma'])
    expect(sortRows(rows, columns, { desc: true, id: 'name' }).map((r) => r.name)).toEqual(['Gamma', 'Beta', 'alpha'])
  })
})

describe('getVisibleColumns', () => {
  it('respects breakpoints, hidden columns and per-breakpoint order', () => {
    expect(getVisibleColumns(columns, 'mobile', new Set()).map((c) => c.id)).toEqual(['name'])
    expect(getVisibleColumns(columns, 'xl', new Set()).map((c) => c.id)).toEqual(['status', 'name'])
    expect(getVisibleColumns(columns, 'xl', new Set(['status'])).map((c) => c.id)).toEqual(['name'])
  })
})

describe('getFacetCounts', () => {
  it('counts rows per value', () => {
    expect(getFacetCounts(rows, columns[1])).toEqual(
      new Map([
        ['done', 2],
        ['todo', 1],
      ]),
    )
  })
})
