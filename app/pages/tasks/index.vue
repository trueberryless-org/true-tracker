<script setup lang="ts">
useHead({ title: 'Tasks · Time Tracker' })

const route = useRoute()
const { user } = useTracker()
const rows = computed(() => (user.value ? getExtendedTasks(user.value) : []))
const initialFilters = computed(() => {
  const project = user.value?.projects.find((p) => p.id === route.query.projectId)
  return project ? { projectName: [project.name] } : undefined
})
const facetedFilters = computed(() => [
  { columnId: 'projectName', options: getUniqueNames(user.value?.projects.map((p) => p.name) ?? []), title: 'Project' },
  { columnId: 'status', options: taskStatuses, title: 'Status' },
  { columnId: 'priority', options: priorities, title: 'Priority' },
])

function getCreateLink(filters: TableFilters) {
  const selected = filters.projectName
  if (!Array.isArray(selected) || selected.length !== 1) return '/tasks/new'

  const project = user.value?.projects.find((p) => p.name === selected[0])
  if (!project) return '/tasks/new'
  return project.archivedAt ? undefined : `/tasks/new?projectId=${project.id}`
}
</script>

<template>
  <LoadingAlert v-if="!user" />
  <PageContainer v-else>
    <div class="flex h-full flex-1 flex-col">
      <DataTable
        :key="route.fullPath"
        title="Tasks"
        :data="rows"
        :columns="taskColumns"
        :initial-filters="initialFilters"
        :page-sizes="[10, 20, 30, 40, 50]"
        :create-to="getCreateLink"
        create-label="Create New Task"
        :row-to="(row) => `/tasks/${row.id}`"
      >
        <template #toolbar="{ table }">
          <DataTableToolbar
            :table="table"
            search-column="name"
            search-placeholder="Filter tasks..."
            :faceted-filters="facetedFilters"
          />
        </template>
        <template #cell-name="{ row }">
          <TableNameCell :name="row.name" :archived="row.projectIsArchived" :running="row.someSessionIsRunning" />
        </template>
        <template #cell-description="{ row }">
          <div class="flex space-x-2">
            <span class="max-w-[500px] truncate font-medium">{{ row.description }}</span>
          </div>
        </template>
        <template #cell-projectName="{ row }">
          <div class="flex space-x-2">
            <span class="max-w-[500px] truncate font-medium">{{ row.projectName }}</span>
          </div>
        </template>
        <template #cell-timeSpent="{ row }">
          <div class="font-medium">{{ formatDurationLong(getCompletedTaskDuration(row)) }}</div>
        </template>
        <template #cell-status="{ row }">
          <OptionLabel class="[&>svg]:text-muted-foreground w-[100px]" :options="taskStatuses" :value="row.status" />
        </template>
        <template #cell-priority="{ row }">
          <OptionLabel class="[&>svg]:text-muted-foreground" :options="priorities" :value="row.priority" />
        </template>
        <template #cell-actions="{ row }">
          <DataTableRowActions
            :label="row.name"
            :view-to="`/tasks/${row.id}`"
            :edit-to="row.projectIsArchived ? undefined : `/tasks/${row.id}/edit`"
          />
        </template>
      </DataTable>
    </div>
  </PageContainer>
</template>
