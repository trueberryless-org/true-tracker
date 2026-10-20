<script setup lang="ts">
useHead({ title: 'Projects · Time Tracker' })

const { user } = useTracker()
const rows = computed(() => (user.value ? getExtendedProjects(user.value) : []))
const facetedFilters = [
  { columnId: 'status', options: projectStatuses, title: 'Status' },
  { columnId: 'priority', options: priorities, title: 'Priority' },
]
</script>

<template>
  <LoadingAlert v-if="!user" />
  <PageContainer v-else-if="rows.length === 0" class="items-center justify-center">
    <Card class="sm:col-span-2">
      <CardHeader class="pb-3">
        <CardTitle as="h1">Welcome to Your Project Dashboard</CardTitle>
        <CardDescription class="max-w-xl pt-2 leading-relaxed text-balance">
          You currently have no projects set up. Start by creating your very first project! Your projects will help you
          organize tasks and track their progress effectively. Each project includes a name, description, status
          (planned, in progress, completed, etc.), priority (low, medium, high), and a list of associated tasks. Begin
          by clicking the &quot;Create New Project&quot; button below to get started.
        </CardDescription>
      </CardHeader>
      <CardContent />
      <CardFooter>
        <Button as-child>
          <NuxtLink to="/projects/new">Create New Project</NuxtLink>
        </Button>
      </CardFooter>
    </Card>
  </PageContainer>
  <PageContainer v-else>
    <div class="flex h-full flex-1 flex-col">
      <DataTable
        title="Projects"
        :data="rows"
        :columns="projectColumns"
        create-to="/projects/new"
        create-label="Create New Project"
        :row-to="(row) => `/projects/${row.id}`"
      >
        <template #toolbar="{ table }">
          <DataTableToolbar
            :table="table"
            search-column="name"
            search-placeholder="Filter projects..."
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
        <template #cell-createdAt="{ row }">
          <div class="font-medium">{{ formatLongDate(row.createdAt) }}</div>
        </template>
        <template #cell-lastUpdatedAt="{ row }">
          <div class="font-medium">{{ formatLongDate(row.lastUpdatedAt) }}</div>
        </template>
        <template #cell-status="{ row }">
          <OptionLabel class="[&>svg]:text-muted-foreground w-[100px]" :options="projectStatuses" :value="row.status" />
        </template>
        <template #cell-priority="{ row }">
          <OptionLabel class="[&>svg]:text-muted-foreground" :options="priorities" :value="row.priority" />
        </template>
        <template #cell-actions="{ row }">
          <DataTableRowActions
            :label="row.name"
            :view-to="`/projects/${row.id}`"
            :edit-to="row.projectIsArchived ? undefined : `/projects/${row.id}/edit`"
          />
        </template>
      </DataTable>
    </div>
  </PageContainer>
</template>
