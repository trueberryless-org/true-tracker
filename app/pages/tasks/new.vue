<script setup lang="ts">
import { toast } from 'vue-sonner'

useHead({ title: 'New Task · Time Tracker' })

const route = useRoute()
const router = useRouter()
const { user } = useTracker()
const task = ref<Task>(createTask())
const form = useTemplateRef<{ focusProject: () => void }>('form')
const projects = computed(() => user.value?.projects.filter((project) => !project.archivedAt) ?? [])
const selectedProjectId = ref<string | undefined>(
  typeof route.query.projectId === 'string' ? route.query.projectId : undefined,
)
const projectId = computed({
  get: () => (projects.value.some((p) => p.id === selectedProjectId.value) ? selectedProjectId.value : undefined),
  set: (value) => {
    selectedProjectId.value = value
  },
})

function saveTask() {
  if (!projectId.value) {
    toast('Please select a project!')
    form.value?.focusProject()
    return
  }
  addTask(projectId.value, task.value)
  navigateTo(`/tasks/${task.value.id}`)
}
</script>

<template>
  <LoadingAlert v-if="!user" />
  <PageContainer v-else>
    <form class="grid flex-1 auto-rows-max gap-4" novalidate @submit.prevent="saveTask">
      <div class="flex items-center gap-4">
        <h1 class="flex-1 shrink-0 text-xl font-semibold tracking-tight whitespace-nowrap sm:grow-0">
          {{ task.name || 'New Task' }}
        </h1>
        <Badge variant="outline" class="bg-background ml-auto py-2 sm:ml-0">
          <OptionLabel :options="priorities" :value="task.priority" class="text-muted-foreground" />
        </Badge>
        <Badge variant="outline" class="bg-background ml-auto py-2 sm:ml-0">
          <OptionLabel :options="taskStatuses" :value="task.status" class="text-muted-foreground" />
        </Badge>
        <div class="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" class="text-muted-foreground" @click="router.back()">Discard</Button>
          <Button type="submit" size="sm">Save Task</Button>
        </div>
      </div>
      <TaskForm ref="form" v-model="task" v-model:project-id="projectId" :projects="projects" />
      <div class="flex items-center justify-end gap-2 md:hidden">
        <Button variant="outline" size="sm" class="text-muted-foreground" @click="router.back()">Discard</Button>
        <Button type="submit" size="sm">Save Task</Button>
      </div>
    </form>
  </PageContainer>
</template>
