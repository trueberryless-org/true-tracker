<script setup lang="ts">
import { toast } from 'vue-sonner'

useHead({ title: 'New Session · Time Tracker' })

const route = useRoute()
const router = useRouter()
const { user } = useTracker()
const session = ref<Session>(createSession())
const form = useTemplateRef<{ focusTask: () => void }>('form')
const tasks = computed(
  () => user.value?.projects.filter((project) => !project.archivedAt).flatMap((p) => p.tasks) ?? [],
)
const selectedTaskId = ref<string | undefined>(typeof route.query.taskId === 'string' ? route.query.taskId : undefined)
const taskId = computed({
  get: () => (tasks.value.some((t) => t.id === selectedTaskId.value) ? selectedTaskId.value : undefined),
  set: (value) => {
    selectedTaskId.value = value
  },
})

function saveSession() {
  if (!taskId.value) {
    toast('Please select a task!')
    form.value?.focusTask()
    return
  }
  addSession(taskId.value, session.value)
  navigateTo(`/sessions/${session.value.id}`)
}
</script>

<template>
  <LoadingAlert v-if="!user" />
  <PageContainer v-else>
    <form class="grid flex-1 auto-rows-max gap-4" @submit.prevent="saveSession">
      <div class="flex items-center gap-4">
        <h1 class="sr-only">New Session</h1>
        <Badge variant="outline" class="bg-background ml-auto py-2 sm:ml-0">
          <OptionLabel :options="flows" :value="session.flow" class="text-muted-foreground" />
        </Badge>
        <div class="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" class="text-muted-foreground" @click="router.back()">Discard</Button>
          <Button type="submit" size="sm">Save Session</Button>
        </div>
      </div>
      <SessionForm ref="form" v-model="session" v-model:task-id="taskId" :tasks="tasks" />
      <div class="flex items-center justify-end gap-2 md:hidden">
        <Button variant="outline" size="sm" class="text-muted-foreground" @click="router.back()">Discard</Button>
        <Button type="submit" size="sm">Save Session</Button>
      </div>
    </form>
  </PageContainer>
</template>
