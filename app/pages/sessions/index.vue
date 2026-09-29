<script setup lang="ts">
useHead({ title: 'Sessions · Time Tracker' })

const route = useRoute()
const { user } = useTracker()
const rows = computed(() => (user.value ? getExtendedSessions(user.value) : []))
const initialFilters = computed(() => {
  const context =
    user.value && typeof route.query.taskId === 'string' ? findTaskContext(user.value, route.query.taskId) : undefined
  return context ? { taskName: [context.task.name] } : undefined
})
const facetedFilters = computed(() => [
  { columnId: 'projectName', options: getUniqueNames(user.value?.projects.map((p) => p.name) ?? []), title: 'Project' },
  {
    columnId: 'taskName',
    options: getUniqueNames(user.value ? getAllTasks(user.value).map((t) => t.name) : []),
    title: 'Task',
  },
  { columnId: 'flow', options: flows, title: 'Flow' },
])

function getCreateLink(filters: TableFilters) {
  const selected = filters.taskName
  if (!user.value || !Array.isArray(selected) || selected.length !== 1) return '/sessions/new'

  const task = getAllTasks(user.value).find((t) => t.name === selected[0])
  if (!task) return '/sessions/new'
  return isProjectArchived(findTaskContext(user.value, task.id)?.project)
    ? undefined
    : `/sessions/new?taskId=${task.id}`
}
</script>

<template>
  <LoadingAlert v-if="!user" />
  <PageContainer v-else>
    <div class="flex h-full flex-1 flex-col">
      <DataTable
        :key="route.fullPath"
        title="Sessions"
        :data="rows"
        :columns="sessionColumns"
        :initial-filters="initialFilters"
        :create-to="getCreateLink"
        create-label="Create New Session"
        :row-to="(row) => `/sessions/${row.id}`"
      >
        <template #toolbar="{ table }">
          <DataTableToolbar :table="table" :faceted-filters="facetedFilters" />
        </template>
        <template #cell-projectName="{ row }">
          <div class="flex space-x-2">
            <span class="max-w-[500px] truncate font-medium">{{ row.projectName }}</span>
          </div>
        </template>
        <template #cell-taskName="{ row }">
          <div class="flex space-x-2">
            <span class="max-w-[500px] truncate font-medium">{{ row.taskName }}</span>
          </div>
        </template>
        <template #cell-description="{ row }">
          <div class="flex space-x-2">
            <span class="max-w-[500px] truncate font-medium">{{ row.description }}</span>
          </div>
        </template>
        <template #cell-flow="{ row }">
          <div class="flex w-[100px] items-center">
            <Badge v-if="row.projectIsArchived" variant="destructive">Archived</Badge>
            <OptionLabel class="[&>svg]:text-muted-foreground" :options="flows" :value="row.flow" />
          </div>
        </template>
        <template #cell-start="{ row }">
          <div class="font-medium">{{ formatClockTime(row.start) }}</div>
        </template>
        <template #cell-end="{ row }">
          <div class="font-medium">{{ row.end ? formatClockTime(row.end) : 'Still running' }}</div>
        </template>
        <template #cell-duration="{ row }">
          <div class="font-medium">{{ formatDurationLong(getSessionDuration(row)) }}</div>
        </template>
        <template #cell-actions="{ row }">
          <DataTableRowActions
            :label="`Session on ${row.taskName}`"
            :view-to="`/sessions/${row.id}`"
            :edit-to="row.projectIsArchived ? undefined : `/sessions/${row.id}/edit`"
          />
        </template>
      </DataTable>
    </div>
    <CalendarSessionCalendar
      description="All your sessions. Click or drag in the calendar to add, move or resize sessions."
    />
  </PageContainer>
</template>
