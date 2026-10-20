const TAILWIND_BREAKPOINTS = { lg: 1024, md: 768, sm: 640, xl: 1280 }

export function useTableBreakpoint() {
  const breakpoints = useBreakpoints(TAILWIND_BREAKPOINTS)
  return computed<TableBreakpoint>(() => {
    if (breakpoints.xl.value) return 'xl'
    if (breakpoints.lg.value) return 'lg'
    if (breakpoints.md.value) return 'md'
    if (breakpoints.sm.value) return 'sm'
    return 'mobile'
  })
}

export function useDataTable<T>(options: DataTableOptions<T>) {
  const breakpoint = useTableBreakpoint()
  const sorting = ref<TableSorting | null>(null)
  const filters = ref<TableFilters>({})
  const hiddenColumns = ref(new Set<string>())
  const pageIndex = ref(0)
  const pageSize = ref(10)

  const columns = computed(() => toValue(options.columns))
  const rows = computed(() => toValue(options.data))
  const visibleColumns = computed(() => getVisibleColumns(columns.value, breakpoint.value, hiddenColumns.value))
  const hideableColumns = computed(() =>
    columns.value.filter(
      (column) => column.accessor && column.hideable !== false && column.breakpoints.includes(breakpoint.value),
    ),
  )
  const filteredRows = computed(() => filterRows(rows.value, columns.value, filters.value))
  const sortedRows = computed(() => sortRows(filteredRows.value, columns.value, sorting.value))
  const isPaginated = computed(() => toValue(options.paginate) ?? true)
  const pageCount = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / pageSize.value)))
  const pageRows = computed(() =>
    isPaginated.value ? paginateRows(sortedRows.value, pageIndex.value, pageSize.value) : sortedRows.value,
  )
  const isFiltered = computed(() => Object.values(filters.value).some(isFilterActive))

  watch(
    [filters, pageSize],
    () => {
      pageIndex.value = 0
    },
    { deep: true },
  )

  function setFilter(id: string, value: TableFilters[string]) {
    filters.value = { ...filters.value, [id]: value }
  }

  function resetFilters() {
    filters.value = {}
  }

  function setColumnVisible(id: string, visible: boolean) {
    const next = new Set(hiddenColumns.value)
    if (visible) next.delete(id)
    else next.add(id)
    hiddenColumns.value = next
  }

  function getFacets(id: string) {
    return getFacetCounts(
      filteredRowsExcept(id),
      columns.value.find((column) => column.id === id),
    )
  }

  function filteredRowsExcept(id: string) {
    const { [id]: _omitted, ...rest } = filters.value
    return filterRows(rows.value, columns.value, rest)
  }

  return {
    filteredRows,
    filters,
    getFacets,
    hiddenColumns,
    hideableColumns,
    isFiltered,
    isPaginated,
    pageCount,
    pageIndex,
    pageRows,
    pageSize,
    resetFilters,
    setColumnVisible,
    setFilter,
    sortedRows,
    sorting,
    visibleColumns,
  }
}

export type DataTable<T> = ReturnType<typeof useDataTable<T>>

interface DataTableOptions<T> {
  columns: MaybeRefOrGetter<TableColumn<T>[]>
  data: MaybeRefOrGetter<T[]>
  paginate?: MaybeRefOrGetter<boolean>
}
