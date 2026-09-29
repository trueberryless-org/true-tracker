<script setup lang="ts">
import {
  Activity,
  Archive,
  ArrowUpRight,
  Calculator,
  CalendarCog,
  CalendarMinus,
  CalendarPlus,
  ChevronLeft,
  Plus,
  Timer,
  Workflow,
} from '@lucide/vue'

const route = useRoute()
const { loaded, user } = useTracker()
const projectId = computed(() => String(route.params.id))
const project = computed(() => user.value?.projects.find((p) => p.id === projectId.value))

useHead(() => ({ title: `${project.value?.name ?? 'Project'} · Time Tracker` }))

const recentTasks = computed(() =>
  (project.value?.tasks ?? [])
    .map((task) => ({ ...task, isRunning: isTaskRunning(task), mostRecentDate: getMostRecentSessionDateOfTask(task) }))
    .sort((a, b) => b.mostRecentDate.valueOf() - a.mostRecentDate.valueOf())
    .slice(0, 5),
)

const stats = computed(() => {
  if (!user.value || !project.value) return null
  const current = project.value
  const createdAt = current.createdAt?.getTime() ?? Number.NaN
  const createdBefore = user.value.projects.filter((p) => p.createdAt && p.createdAt.getTime() < createdAt).length
  const archivedCount = user.value.projects.filter((p) => p.archivedAt).length
  const sessions = current.tasks.flatMap((task) => task.sessions)
  const duration = getProjectDuration(current)
  const daysAfterCreation = ((current.lastUpdatedAt?.getTime() ?? Number.NaN) - createdAt) / (1000 * 60 * 60 * 24)

  return {
    archivedText: `One of ${pluralize(archivedCount, 'archived project')}`,
    createdBeforeText: `${pluralize(createdBefore, 'project')} created before this one`,
    daysAfterCreationText: `${daysAfterCreation.toFixed(0)} days after creation`,
    duration: formatDurationLong(duration),
    durationAround: formatDurationDaysOrSecondsLong(duration),
    highPriorityTasks: pluralize(current.tasks.filter((task) => task.priority === 'high').length, 'task'),
    priorityComparison: getProjectPriorityComparison(user.value, current.priority),
    sessionCount: pluralize(sessions.length, 'session'),
    smoothSessions: pluralize(sessions.filter((session) => session.flow === 'smooth').length, 'session'),
    statusComparison: getProjectStatusComparison(user.value, current.status),
    taskCount: pluralize(current.tasks.length, 'task'),
  }
})
</script>

<template>
  <LoadingAlert v-if="!loaded || !user" />
  <NotFoundAlert v-else-if="!project || !stats" entity="project" back-to="/projects" />
  <PageContainer v-else>
    <div class="flex min-h-9 items-center gap-4">
      <Button as-child variant="outline" size="icon" class="text-muted-foreground h-7 w-7 shrink-0">
        <NuxtLink to="/projects">
          <ChevronLeft class="h-4 w-4" aria-hidden="true" />
          <span class="sr-only">Back to projects</span>
        </NuxtLink>
      </Button>
      <h1 class="truncate text-xl font-semibold tracking-tight">{{ project.name }}</h1>
      <Badge variant="outline" class="bg-background max-xs:hidden ml-auto py-2 sm:ml-0">
        <OptionLabel :options="priorities" :value="project.priority" class="text-muted-foreground" />
      </Badge>
      <Badge variant="outline" class="bg-background ml-auto py-2 max-sm:hidden sm:ml-0">
        <OptionLabel :options="projectStatuses" :value="project.status" class="text-muted-foreground" />
      </Badge>
      <Badge v-if="project.archivedAt" variant="destructive" class="ml-auto py-2 max-md:hidden sm:ml-0">
        <div class="flex items-center">
          <Archive class="mr-2 h-4 w-4" aria-hidden="true" />
          Archived
        </div>
      </Badge>
      <div class="ml-auto flex items-center gap-2">
        <Button v-if="!project.archivedAt" as-child size="sm">
          <NuxtLink :to="`/projects/${project.id}/edit`">Edit Project</NuxtLink>
        </Button>
        <Button v-else size="sm" variant="outline" @click="unarchiveProject(project.id)">Unarchive</Button>
      </div>
    </div>
    <section
      aria-label="Project overview"
      :class="
        cn(
          'grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4',
          project.archivedAt ? 'xl:grid-cols-5' : 'xl:grid-cols-4',
        )
      "
    >
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary text-sm font-medium">Creation</CardTitle>
          <CalendarPlus class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatLongDate(project.createdAt, 'N/A') }}</div>
          <p class="text-muted-foreground text-xs">{{ stats.createdBeforeText }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary text-sm font-medium">Last Update</CardTitle>
          <CalendarCog class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatLongDate(project.lastUpdatedAt, 'N/A') }}</div>
          <p class="text-muted-foreground text-xs">{{ stats.daysAfterCreationText }}</p>
        </CardContent>
      </Card>
      <Card v-if="project.archivedAt" class="hidden xl:block">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary text-sm font-medium">Deletion</CardTitle>
          <CalendarMinus class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatLongDate(project.archivedAt, 'N/A') }}</div>
          <p class="text-muted-foreground text-xs">{{ stats.archivedText }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary text-sm font-medium">Status</CardTitle>
          <Workflow class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold"><OptionLabel :options="projectStatuses" :value="project.status" /></div>
          <p class="text-muted-foreground text-xs">{{ stats.statusComparison }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary text-sm font-medium">Priority</CardTitle>
          <Activity class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold"><OptionLabel :options="priorities" :value="project.priority" /></div>
          <p class="text-muted-foreground text-xs">{{ stats.priorityComparison }}</p>
        </CardContent>
      </Card>
    </section>
    <div class="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <Card class="row-span-3 max-lg:order-1 xl:col-span-2">
        <CardHeader class="flex flex-row items-center gap-4">
          <div class="grid gap-2">
            <CardTitle as="h2">Tasks</CardTitle>
            <CardDescription>Recent tasks for this project.</CardDescription>
          </div>
          <div class="ml-auto flex flex-row items-center gap-4">
            <Button v-if="!project.archivedAt" as-child size="sm" class="gap-1 max-md:hidden">
              <NuxtLink :to="`/tasks/new?projectId=${project.id}`">
                Create New Task
                <Plus class="h-4 w-4" aria-hidden="true" />
              </NuxtLink>
            </Button>
            <Button as-child size="sm" class="gap-1" variant="outline">
              <NuxtLink :to="`/tasks?projectId=${project.id}`">
                View All
                <ArrowUpRight class="h-4 w-4" aria-hidden="true" />
              </NuxtLink>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Task</TableHead>
                <TableHead scope="col" class="text-right">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="task in recentTasks"
                :key="task.id"
                class="cursor-pointer"
                @click="navigateTo(`/tasks/${task.id}`)"
              >
                <TableCell>
                  <div class="flex items-center space-x-2">
                    <Badge v-if="task.isRunning" variant="default" class="px-3 py-1">Running</Badge>
                    <div>
                      <NuxtLink
                        :to="`/tasks/${task.id}`"
                        class="focus-visible:ring-ring block rounded-sm font-medium outline-hidden focus-visible:ring-2"
                      >
                        {{ task.name }}
                      </NuxtLink>
                      <div class="text-muted-foreground hidden text-sm md:inline">{{ task.description }}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell class="text-right">
                  <OptionLabel :options="priorities" :value="task.priority" justify="right" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary text-sm font-medium">Duration</CardTitle>
          <Timer class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.duration }}</div>
          <p class="text-muted-foreground text-xs">You could also say around {{ stats.durationAround }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary text-sm font-medium">Task Count</CardTitle>
          <Calculator class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.taskCount }}</div>
          <p class="text-muted-foreground text-xs">{{ stats.highPriorityTasks }} with high priority</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary text-sm font-medium">Project Status</CardTitle>
          <Workflow class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold"><OptionLabel :options="projectStatuses" :value="project.status" /></div>
          <p class="text-muted-foreground text-xs">{{ stats.statusComparison }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary text-sm font-medium">Session Count</CardTitle>
          <Calculator class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.sessionCount }}</div>
          <p class="text-muted-foreground text-xs">{{ stats.smoothSessions }} with smooth flow</p>
        </CardContent>
      </Card>
    </div>
  </PageContainer>
</template>
