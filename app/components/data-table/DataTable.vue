<script setup lang="ts" generic="T extends { id: string }">
import { Plus } from '@lucide/vue'

const {
  columns,
  createLabel,
  createTo,
  data,
  initialFilters,
  pageSizes = [5, 10, 20, 50, 100],
  rowTo,
  title,
} = defineProps<{
  columns: TableColumn<T>[]
  createLabel?: string
  createTo?: string | ((filters: TableFilters) => string | undefined)
  data: T[]
  initialFilters?: TableFilters
  pageSizes?: number[]
  rowTo: (row: T) => string
  title: string
}>()

defineSlots<
  {
    [K in `cell-${string}`]?: (props: { row: T }) => unknown
  } & {
    toolbar?: (props: { table: DataTable<T> }) => unknown
  }
>()

const breakpoint = useTableBreakpoint()
const table = useDataTable<T>({
  columns: () => columns,
  data: () => data,
  paginate: () => breakpoint.value !== 'mobile',
})
if (initialFilters) table.filters.value = { ...initialFilters }

const createLink = computed(() => (typeof createTo === 'function' ? createTo(table.filters.value) : createTo))
const { pageCount, pageIndex, pageRows, pageSize, setColumnVisible, sortedRows, sorting, visibleColumns } = table

function ariaSort(columnId: string) {
  if (sorting.value?.id !== columnId) return undefined
  return sorting.value.desc ? 'descending' : 'ascending'
}

function openRow(row: T, event: MouseEvent) {
  if ((event.target as HTMLElement).closest('a, button, [role="menuitem"]')) return
  navigateTo(rowTo(row))
}
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <h1>{{ title }}</h1>
        <Button v-if="createLink" as-child size="sm" class="gap-1">
          <NuxtLink :to="createLink">
            {{ createLabel }}
            <Plus class="h-4 w-4" aria-hidden="true" />
          </NuxtLink>
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <slot name="toolbar" :table="table" />
        <div class="rounded-md border">
          <Table>
            <caption class="sr-only">
              {{
                title
              }}
            </caption>
            <TableHeader>
              <TableRow>
                <TableHead
                  v-for="column in visibleColumns"
                  :key="column.id"
                  :aria-sort="ariaSort(column.id)"
                  :scope="column.title ? 'col' : undefined"
                >
                  <DataTableColumnHeader
                    v-if="column.title"
                    v-model:sorting="sorting"
                    :column-id="column.id"
                    :title="column.title"
                    :can-sort="column.sortable !== false && Boolean(column.accessor)"
                    :can-hide="column.hideable !== false"
                    @hide="setColumnVisible(column.id, false)"
                  />
                  <span v-else class="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="pageRows.length">
                <TableRow v-for="row in pageRows" :key="row.id" class="cursor-pointer" @click="openRow(row, $event)">
                  <TableCell
                    v-for="(column, index) in visibleColumns"
                    :key="column.id"
                    :class="cn('truncate', column.cellClass)"
                  >
                    <NuxtLink
                      v-if="index === 0"
                      :to="rowTo(row)"
                      class="focus-visible:ring-ring block rounded-sm outline-hidden focus-visible:ring-2"
                    >
                      <slot :name="`cell-${column.id}`" :row="row" />
                    </NuxtLink>
                    <slot v-else :name="`cell-${column.id}`" :row="row" />
                  </TableCell>
                </TableRow>
              </template>
              <TableRow v-else>
                <TableCell :colspan="visibleColumns.length" class="h-24 text-center">No results.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <DataTablePagination
          v-if="table.isPaginated.value"
          v-model:page-index="pageIndex"
          v-model:page-size="pageSize"
          :page-count="pageCount"
          :page-sizes="pageSizes"
          :total="sortedRows.length"
        />
      </div>
    </CardContent>
  </Card>
</template>
