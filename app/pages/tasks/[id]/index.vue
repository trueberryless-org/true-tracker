<script setup lang="ts">
import { Activity, Archive, ArrowUpRight, BadgeInfo, Book, ChevronLeft, Plus, Workflow } from '@lucide/vue'

const route = useRoute()
const { loaded, user } = useTracker()
const taskId = computed(() => String(route.params.id))
const context = computed(() => (user.value ? findTaskContext(user.value, taskId.value) : undefined))
const task = computed(() => context.value?.task)
const now = useSecondTicker()
const isArchived = computed(() => isProjectArchived(context.value?.project))
const recentSessions = computed(() =>
  [...(task.value?.sessions ?? [])].sort((a, b) => b.start.getTime() - a.start.getTime()).slice(0, 3),
)

useHead(() => ({ title: `${task.value?.name ?? 'Task'} · Time Tracker` }))
</script>

<template>
  <LoadingAlert v-if="!loaded || !user" />
  <NotFoundAlert v-else-if="!context || !task" entity="task" back-to="/tasks" />
  <PageContainer v-else>
    <div class="flex min-h-9 items-center gap-4 overflow-hidden">
      <Button as-child variant="outline" size="icon" class="text-muted-foreground h-7 w-7 shrink-0">
        <NuxtLink to="/tasks">
          <ChevronLeft class="h-4 w-4" aria-hidden="true" />
          <span class="sr-only">Back to tasks</span>
        </NuxtLink>
      </Button>
      <h1 class="truncate text-xl font-semibold tracking-tight">{{ task.name }}</h1>
      <Badge v-if="task.priority" variant="outline" class="bg-background max-xs:hidden ml-auto py-2 sm:ml-0">
        <OptionLabel :options="priorities" :value="task.priority" class="text-muted-foreground" />
      </Badge>
      <Badge v-if="task.status" variant="outline" class="bg-background ml-auto py-2 max-sm:hidden sm:ml-0">
        <OptionLabel :options="taskStatuses" :value="task.status" class="text-muted-foreground" />
      </Badge>
      <Badge v-if="isArchived" variant="destructive" class="ml-auto py-2 max-md:hidden sm:ml-0">
        <div class="flex items-center">
          <Archive class="mr-2 h-4 w-4" aria-hidden="true" />
          Archived by project
        </div>
      </Badge>
      <div class="ml-auto flex items-center gap-2">
        <Button v-if="!isArchived" as-child size="sm">
          <NuxtLink :to="`/tasks/${task.id}/edit`">Edit Task</NuxtLink>
        </Button>
        <Button v-else size="sm" disabled>Edit Task</Button>
      </div>
    </div>
    <section
      aria-label="Task overview"
      :class="cn('grid gap-4 md:grid-cols-2 md:gap-8', task.description ? 'lg:grid-cols-4' : 'lg:grid-cols-3')"
    >
      <Card class="focus-within:ring-ring relative cursor-pointer focus-within:ring-2">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary-text text-sm font-medium">Project</CardTitle>
          <Book class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <NuxtLink
            :to="`/projects/${context.project.id}`"
            class="text-2xl font-bold outline-hidden after:absolute after:inset-0 after:content-['']"
          >
            {{ context.project.name }}
          </NuxtLink>
          <p class="text-muted-foreground text-xs">Click to go to project.</p>
        </CardContent>
      </Card>
      <Card v-if="task.description">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary-text text-sm font-medium">Description</CardTitle>
          <BadgeInfo class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="truncate text-2xl font-bold">{{ task.description }}</div>
          <p class="text-muted-foreground text-xs">Now it makes sense!</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary-text text-sm font-medium">Status</CardTitle>
          <Workflow class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold"><OptionLabel :options="taskStatuses" :value="task.status" /></div>
          <p class="text-muted-foreground text-xs">{{ getTaskStatusComparison(user, task.status) }}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary-text text-sm font-medium">Priority</CardTitle>
          <Activity class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold"><OptionLabel :options="priorities" :value="task.priority" /></div>
          <p class="text-muted-foreground text-xs">{{ getTaskPriorityComparison(user, task.priority) }}</p>
        </CardContent>
      </Card>
    </section>
    <div class="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div v-if="!isArchived" class="xl:col-span-2">
        <Card>
          <CardHeader>
            <h2>Quick Session Control</h2>
          </CardHeader>
          <CardContent>
            <StartStopButton :task="task" show-elapsed-time />
          </CardContent>
        </Card>
      </div>
      <Card class="xl:col-span-2">
        <CardHeader class="flex flex-row items-center">
          <div class="grid gap-2">
            <CardTitle as="h2">Sessions</CardTitle>
            <CardDescription>Recent sessions for this task.</CardDescription>
          </div>
          <div class="ml-auto flex flex-row items-center gap-4">
            <Button v-if="!isArchived" as-child size="sm" class="gap-1 max-md:hidden">
              <NuxtLink :to="`/sessions/new?taskId=${task.id}`">
                Create New Session
                <Plus class="h-4 w-4" aria-hidden="true" />
              </NuxtLink>
            </Button>
            <Button as-child size="sm" class="gap-1" variant="outline">
              <NuxtLink :to="`/sessions?taskId=${task.id}`">
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
                <TableHead scope="col">Start</TableHead>
                <TableHead scope="col" class="text-right">End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="session in recentSessions"
                :key="session.id"
                class="cursor-pointer"
                @click="navigateTo(`/sessions/${session.id}`)"
              >
                <TableCell>
                  <NuxtLink
                    :to="`/sessions/${session.id}`"
                    class="focus-visible:ring-ring block rounded-sm font-medium outline-hidden focus-visible:ring-2"
                  >
                    {{ formatDateTime(session.start) }}
                  </NuxtLink>
                  <div class="text-muted-foreground hidden text-sm md:inline">
                    {{ formatDateToDistanceFromNow(session.start, now.getTime()) }}
                  </div>
                </TableCell>
                <TableCell class="text-right">
                  <div class="font-medium">{{ session.end ? formatDateTime(session.end) : 'Active' }}</div>
                  <div class="text-muted-foreground hidden text-sm md:inline">
                    {{ session.end ? formatDateToDistanceFromNow(session.end, now.getTime()) : '' }}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    <CalendarSessionCalendar
      :key="task.id"
      :task-id="task.id"
      :default-task-id="isArchived ? undefined : task.id"
      title="Task Calendar"
      description="All sessions of this task. Click or drag in the calendar to add, move or resize sessions."
    />
  </PageContainer>
</template>
