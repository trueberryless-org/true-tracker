<script setup lang="ts">
const { tasks } = defineProps<{ tasks?: Task[] }>()
const session = defineModel<Session>({ required: true })
const taskId = defineModel<string | undefined>('taskId')
const taskTrigger = useTemplateRef<{ $el: HTMLElement }>('taskTrigger')
const taskName = computed(() => tasks?.find((t) => t.id === taskId.value)?.name)

const start = computed({
  get: () => session.value.start,
  set: (value: Date) => {
    session.value = { ...session.value, start: value }
  },
})
const end = computed({
  get: () => session.value.end ?? new Date(),
  set: (value: Date) => {
    session.value = { ...session.value, end: value }
  },
})

defineExpose({ focusTask: () => taskTrigger.value?.$el.focus() })
</script>

<template>
  <div class="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
    <div class="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
      <Card>
        <CardHeader>
          <CardTitle as="h2">Session Details</CardTitle>
          <CardDescription>Edit the description of the session.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-6">
            <div class="grid gap-3">
              <Label for="session-id">Identifier</Label>
              <Input id="session-id" :model-value="session.id" class="w-full" disabled />
            </div>
            <div v-if="tasks" class="grid gap-3">
              <Label for="session-task">Task</Label>
              <Select v-model="taskId">
                <SelectTrigger id="session-task" ref="taskTrigger" aria-required="true">
                  <SelectValue placeholder="Select task">{{ taskName ?? 'Select task' }}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="task in tasks" :key="task.id" :value="task.id">{{ task.name }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-3">
              <Label for="session-description">Description</Label>
              <Textarea id="session-description" v-model="session.description" class="min-h-36" />
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
              <div>Session Flow</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-6">
            <div class="grid gap-3">
              <Label for="session-flow">Flow</Label>
              <Select v-model="session.flow">
                <SelectTrigger id="session-flow">
                  <SelectValue placeholder="Select flow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="flow in flows" :key="flow.value" :value="flow.value">
                    <OptionLabel :options="flows" :value="flow.value" />
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <template v-if="tasks">
        <Card>
          <CardHeader>
            <CardTitle as="h2">
              <div class="flex items-center justify-between">
                <div>Session Start Time</div>
                <InfoHoverCard label="About the session start time">
                  We automatically assume that the session lasted for three hours.
                </InfoHoverCard>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-6">
              <div class="grid gap-3">
                <TimePicker12 v-model:date="start" label="Session start time" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle as="h2">
              <div class="flex items-center justify-between">
                <div>Session End Time</div>
                <InfoHoverCard label="About the session end time">
                  We automatically assume that manually added sessions ended right now.
                </InfoHoverCard>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid gap-6">
              <div class="grid gap-3">
                <TimePicker12 v-model:date="end" label="Session end time" />
              </div>
            </div>
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
</template>
