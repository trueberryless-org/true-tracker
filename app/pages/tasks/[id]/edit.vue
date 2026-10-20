<script setup lang="ts">
import { ChevronLeft } from '@lucide/vue'

const route = useRoute()
const { isAccount, loaded, user } = useTracker()
const taskId = computed(() => String(route.params.id))
const context = computed(() => (user.value ? findTaskContext(user.value, taskId.value) : undefined))
const task = ref<Task | null>(null)
const deleteDialogOpen = ref(false)

useHead(() => ({ title: `Edit ${context.value?.task.name ?? 'Task'} · Time Tracker` }))

watch(
  context,
  (value) => {
    if (value && !task.value) task.value = structuredClone(toRaw(value.task))
  },
  { immediate: true },
)

function saveTask() {
  if (!task.value) return
  updateTask(task.value)
  navigateTo(`/tasks/${task.value.id}`)
}

function removeTask() {
  deleteTask(taskId.value)
  navigateTo('/tasks')
}
</script>

<template>
  <LoadingAlert v-if="!loaded || !user" />
  <NotFoundAlert v-else-if="!context || !task" entity="task" back-to="/tasks" />
  <ArchivedAlert v-else-if="context.project.archivedAt">
    This task belongs to a project that has been archived. Please unarchive the project again, by clicking the button in
    the top right of the project view!
  </ArchivedAlert>
  <PageContainer v-else>
    <form class="contents" @submit.prevent="saveTask">
      <div class="flex min-h-9 items-center gap-4 overflow-hidden">
        <Button as-child variant="outline" size="icon" class="text-muted-foreground h-7 w-7 shrink-0">
          <NuxtLink :to="`/tasks/${task.id}`">
            <ChevronLeft class="h-4 w-4" aria-hidden="true" />
            <span class="sr-only">Back to task</span>
          </NuxtLink>
        </Button>
        <h1 class="truncate text-xl font-semibold tracking-tight">{{ task.name }}</h1>
        <Badge variant="outline" class="bg-background max-xs:hidden ml-auto py-2 sm:ml-0">
          <OptionLabel :options="priorities" :value="task.priority" class="text-muted-foreground" />
        </Badge>
        <Badge variant="outline" class="bg-background ml-auto py-2 max-sm:hidden sm:ml-0">
          <OptionLabel :options="taskStatuses" :value="task.status" class="text-muted-foreground" />
        </Badge>
        <div class="flex items-center gap-2 max-md:hidden md:ml-auto">
          <Button variant="destructive" size="sm" @click="deleteDialogOpen = true">Delete</Button>
          <Button as-child variant="outline" size="sm" class="text-muted-foreground">
            <NuxtLink :to="`/tasks/${task.id}`">Discard</NuxtLink>
          </Button>
          <Button type="submit" size="sm">Save Task</Button>
        </div>
      </div>
      <TaskForm v-model="task" />
      <div class="flex items-center justify-end gap-2 md:hidden">
        <Button variant="destructive" size="sm" @click="deleteDialogOpen = true">Delete</Button>
        <Button as-child variant="outline" size="sm" class="text-muted-foreground">
          <NuxtLink :to="`/tasks/${task.id}`">Discard</NuxtLink>
        </Button>
        <Button type="submit" size="sm">Save Task</Button>
      </div>
    </form>
    <ConfirmDialog v-model:open="deleteDialogOpen" @confirm="removeTask">
      This action cannot be undone. This will permanently delete your task {{ task.name }} and remove this data from
      your {{ isAccount ? 'account' : 'local storage' }}.
    </ConfirmDialog>
  </PageContainer>
</template>
