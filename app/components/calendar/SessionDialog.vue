<script setup lang="ts">
import { format } from 'date-fns'

const { draft, tasks } = defineProps<{ draft: SessionDraft | null; tasks: EditableTask[] }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ delete: [sessionId: string]; save: [session: Session, taskId: string] }>()

const id = useId()
const taskId = ref<string | undefined>()
const flow = ref<Flow>('good')
const description = ref('')
const date = ref('')
const startTime = ref('')
const endTime = ref('')
const isRunning = ref(false)
const error = ref<string | null>(null)
const isNew = computed(() => !draft?.session)
watch([taskId, date, startTime, endTime], () => {
  error.value = null
})

const taskLabel = computed(() => tasks.find((task) => task.id === taskId.value)?.label)

watch(
  () => [open.value, draft] as const,
  ([isOpen, value]) => {
    if (!isOpen || !value) return
    const start = value.session?.start ?? value.start
    const end = value.session ? value.session.end : value.end
    taskId.value = value.taskId
    flow.value = value.session?.flow ?? 'good'
    description.value = value.session?.description ?? ''
    date.value = format(start, 'yyyy-MM-dd')
    startTime.value = format(start, 'HH:mm')
    endTime.value = end ? format(end, 'HH:mm') : format(new Date(), 'HH:mm')
    isRunning.value = Boolean(value.session && !value.session.end)
    error.value = null
  },
  { immediate: true },
)

function save() {
  const start = combineDateAndTime(date.value, startTime.value)
  let end = isRunning.value ? null : combineDateAndTime(date.value, endTime.value)

  if (!taskId.value) {
    error.value = 'Please select a task.'
    return
  }
  if (!start || (!isRunning.value && !end)) {
    error.value = 'Please enter a valid date, start time and end time.'
    return
  }
  if (end && end <= start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000)

  emit(
    'save',
    {
      description: description.value || undefined,
      end,
      flow: flow.value,
      id: draft?.session?.id ?? crypto.randomUUID(),
      start,
    },
    taskId.value,
  )
  open.value = false
}

function remove() {
  if (!draft?.session) return
  emit('delete', draft.session.id)
  open.value = false
}

function combineDateAndTime(day: string, time: string): Date | null {
  const value = new Date(`${day}T${time}`)
  return Number.isNaN(value.getTime()) ? null : value
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-h-[90dvh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isNew ? 'New Session' : 'Edit Session' }}</DialogTitle>
        <DialogDescription>
          {{ isNew ? 'Track a session you worked on.' : 'Change the task, time, flow or description of this session.' }}
        </DialogDescription>
      </DialogHeader>
      <form :id="`${id}-form`" class="grid gap-4" novalidate @submit.prevent="save">
        <div class="grid gap-2">
          <Label :for="`${id}-task`">Task</Label>
          <Select v-model="taskId">
            <SelectTrigger :id="`${id}-task`" aria-required="true">
              <SelectValue placeholder="Select task">{{ taskLabel ?? 'Select task' }}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="task in tasks" :key="task.id" :value="task.id">{{ task.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="grid gap-2">
            <Label :for="`${id}-date`">Date</Label>
            <Input :id="`${id}-date`" v-model="date" type="date" required />
          </div>
          <div class="grid gap-2">
            <Label :for="`${id}-start`">Start</Label>
            <Input :id="`${id}-start`" v-model="startTime" type="time" step="60" required />
          </div>
          <div class="grid gap-2">
            <Label :for="`${id}-end`">End</Label>
            <Input :id="`${id}-end`" v-model="endTime" type="time" step="60" :disabled="isRunning" required />
          </div>
        </div>
        <div v-if="draft?.session && !draft.session.end" class="flex items-center space-x-2">
          <Switch :id="`${id}-running`" v-model="isRunning" />
          <Label :for="`${id}-running`">Still running</Label>
        </div>
        <div class="grid gap-2">
          <Label :for="`${id}-flow`">Flow</Label>
          <Select v-model="flow">
            <SelectTrigger :id="`${id}-flow`">
              <SelectValue placeholder="Select flow" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="option in flows" :key="option.value" :value="option.value">
                <OptionLabel :options="flows" :value="option.value" />
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid gap-2">
          <Label :for="`${id}-description`">Description</Label>
          <Textarea :id="`${id}-description`" v-model="description" class="min-h-24" />
        </div>
        <p v-if="error" class="text-destructive text-sm font-medium" role="alert">{{ error }}</p>
      </form>
      <DialogFooter class="gap-2 sm:gap-0">
        <Button v-if="!isNew" variant="destructive" class="sm:mr-auto" @click="remove">Delete</Button>
        <DialogClose as-child>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" :form="`${id}-form`">Save Session</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
