<script setup lang="ts">
const { projects } = defineProps<{ projects?: Project[] }>()
const task = defineModel<Task>({ required: true })
const projectId = defineModel<string | undefined>('projectId')
const projectTrigger = useTemplateRef<{ $el: HTMLElement }>('projectTrigger')
const projectName = computed(() => projects?.find((p) => p.id === projectId.value)?.name)

function focusProject() {
  projectTrigger.value?.$el.focus()
}

defineExpose({ focusProject })
</script>

<template>
  <div class="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
    <div class="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
      <Card>
        <CardHeader>
          <CardTitle as="h2">Task Details</CardTitle>
          <CardDescription>Edit the name and description of the task.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-6">
            <div class="grid gap-3">
              <Label for="task-id">Identifier</Label>
              <Input id="task-id" :model-value="task.id" class="w-full" disabled />
            </div>
            <div v-if="projects" class="grid gap-3">
              <Label for="task-project">Project</Label>
              <Select v-model="projectId">
                <SelectTrigger id="task-project" ref="projectTrigger" aria-required="true">
                  <SelectValue placeholder="Select project">{{ projectName ?? 'Select project' }}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-3">
              <Label for="task-name">Name</Label>
              <Input id="task-name" v-model="task.name" class="w-full" required />
            </div>
            <div class="grid gap-3">
              <Label for="task-description">Description</Label>
              <Textarea id="task-description" v-model="task.description" class="min-h-36" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    <div class="grid auto-rows-max items-start gap-4 lg:gap-8">
      <Card>
        <CardHeader>
          <CardTitle as="h2">
            <div class="flex items-center justify-between">
              <div>Task Status</div>
              <InfoHoverCard label="About the task status">
                We try to automate this status in order to help you focus on your projects, not this app.
              </InfoHoverCard>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-6">
            <div class="grid gap-3">
              <Label for="task-status">Status</Label>
              <Select v-model="task.status">
                <SelectTrigger id="task-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="status in taskStatuses" :key="status.value" :value="status.value">
                    <OptionLabel :options="taskStatuses" :value="status.value" />
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle as="h2">Task Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-6">
            <div class="grid gap-3">
              <Label for="task-priority">Priority</Label>
              <Select v-model="task.priority">
                <SelectTrigger id="task-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="priority in priorities" :key="priority.value" :value="priority.value">
                    <OptionLabel :options="priorities" :value="priority.value" />
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
