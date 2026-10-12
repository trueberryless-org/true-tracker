import type { Component } from 'vue'

export const TABLE_BREAKPOINTS = ['mobile', 'sm', 'md', 'lg', 'xl'] as const

export function filterRows<T>(rows: T[], columns: TableColumn<T>[], filters: TableFilters): T[] {
  const active = columns.filter((column) => isFilterActive(filters[column.id]))
  if (active.length === 0) return rows

  return rows.filter((row) =>
    active.every((column) => {
      const filter = filters[column.id]
      const value = column.accessor?.(row)
      if (Array.isArray(filter)) return filter.includes(String(value))
      return String(value ?? '')
        .toLowerCase()
        .includes(String(filter).toLowerCase())
    }),
  )
}

export function sortRows<T>(rows: T[], columns: TableColumn<T>[], sorting: TableSorting | null): T[] {
  if (!sorting) return rows
  const column = columns.find((c) => c.id === sorting.id)
  if (!column?.accessor) return rows

  const accessor = column.accessor
  const direction = sorting.desc ? -1 : 1
  return [...rows].sort((a, b) => compareValues(accessor(a), accessor(b)) * direction)
}

export function paginateRows<T>(rows: T[], pageIndex: number, pageSize: number): T[] {
  return rows.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize)
}

export function getFacetCounts<T>(rows: T[], column: TableColumn<T> | undefined): Map<string, number> {
  const counts = new Map<string, number>()
  if (!column?.accessor) return counts
  for (const row of rows) {
    const key = String(column.accessor(row))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

export function getVisibleColumns<T>(
  columns: TableColumn<T>[],
  breakpoint: TableBreakpoint,
  hidden: Set<string>,
): TableColumn<T>[] {
  return columns
    .map((column, index) => ({ column, order: column.order?.[breakpoint] ?? index }))
    .filter(({ column }) => column.breakpoints.includes(breakpoint) && !hidden.has(column.id))
    .sort((a, b) => a.order - b.order)
    .map(({ column }) => column)
}

export function isFilterActive(filter: TableFilters[string]): boolean {
  if (filter === undefined) return false
  return Array.isArray(filter) ? filter.length > 0 : filter !== ''
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

export type TableBreakpoint = (typeof TABLE_BREAKPOINTS)[number]
export type TableFilters = Record<string, string | string[] | undefined>

export interface TableSorting {
  desc: boolean
  id: string
}

export interface TableColumn<T> {
  accessor?: (row: T) => unknown
  breakpoints: TableBreakpoint[]
  cellClass?: string
  hideable?: boolean
  id: string
  order?: Partial<Record<TableBreakpoint, number>>
  sortable?: boolean
  title?: string
}

export interface FilterOption {
  icon?: Component
  label: string
  value: string
}
