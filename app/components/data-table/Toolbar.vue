<script setup lang="ts" generic="T">
import { XIcon } from '@lucide/vue'

const { facetedFilters, searchColumn, searchPlaceholder, table } = defineProps<{
  facetedFilters: { columnId: string; options: FilterOption[]; title: string }[]
  searchColumn?: string
  searchPlaceholder?: string
  table: DataTable<T>
}>()

const searchValue = computed({
  get: () => (searchColumn ? String(table.filters.value[searchColumn] ?? '') : ''),
  set: (value: string) => {
    if (searchColumn) table.setFilter(searchColumn, value)
  },
})

function filterModel(columnId: string) {
  return computed({
    get: () => table.filters.value[columnId] as string[] | undefined,
    set: (value: string[] | undefined) => table.setFilter(columnId, value),
  })
}

const models = computed(() =>
  facetedFilters
    .filter((filter) => table.visibleColumns.value.some((column) => column.id === filter.columnId))
    .map((filter) => ({ ...filter, model: filterModel(filter.columnId) })),
)
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-1 flex-wrap items-center space-x-2 gap-y-2">
      <Input
        v-if="searchColumn"
        v-model="searchValue"
        :placeholder="searchPlaceholder"
        :aria-label="searchPlaceholder"
        class="h-8 w-[150px] lg:w-[250px]"
      />
      <DataTableFacetedFilter
        v-for="filter in models"
        :key="filter.columnId"
        v-model="filter.model.value"
        :title="filter.title"
        :options="filter.options"
        :facets="table.getFacets(filter.columnId)"
      />
      <Button v-if="table.isFiltered.value" variant="ghost" class="h-8 px-2 lg:px-3" @click="table.resetFilters()">
        Reset
        <XIcon class="ml-2 h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
    <DataTableViewOptions
      :columns="table.hideableColumns.value"
      :hidden="table.hiddenColumns.value"
      @toggle="table.setColumnVisible"
    />
  </div>
</template>
