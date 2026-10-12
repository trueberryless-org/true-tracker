<script setup lang="ts">
import { ChevronLeft, ChevronRight, Plus } from '@lucide/vue'
import { addHours, startOfHour } from 'date-fns'
import { toast } from 'vue-sonner'

const VIEW_STORAGE_KEY = 'time-tracker-calendar-view'
const VIEW_LABELS: Record<CalendarView, string> = { day: 'Day', month: 'Month', schedule: 'Schedule', week: 'Week' }

const {
  defaultTaskId,
  description,
  highlightId,
  initialDate,
  taskId,
  title = 'Calendar',
} = defineProps<{
  defaultTaskId?: string
  description?: string
  highlightId?: string
  initialDate?: Date
  taskId?: string
  title?: string
}>()

const { user } = useTracker()
const now = useSecondTicker()
const view = ref<CalendarView>('week')
const date = ref(initialDate ?? new Date())
const dialogOpen = ref(false)
const draft = ref<SessionDraft | null>(null)
const announcement = ref('')
const headingId = useId()

const events = computed(() => (user.value ? getCalendarEvents(user.value, { taskId }) : []))
const tasks = computed(() => (user.value ? getEditableTasks(user.value) : []))
const viewTitle = computed(() => formatViewTitle(view.value, date.value))
const days = computed(() => getRangeDays(getViewRange(view.value === 'day' ? 'day' : 'week', date.value)))

onMounted(() => {
  const stored = readSessionValue(VIEW_STORAGE_KEY)
  if (stored && (CALENDAR_VIEWS as readonly string[]).includes(stored)) view.value = stored as CalendarView
  else if (window.matchMedia('(max-width: 639px)').matches) view.value = 'day'
})

watch(view, (value) => writeSessionValue(VIEW_STORAGE_KEY, value))

function selectView(value: CalendarView) {
  view.value = value
}

function showDay(day: Date) {
  date.value = day
  view.value = 'day'
}

function openNewSession() {
  const start = startOfHour(new Date())
  openCreate(addHours(start, -1), start)
}

function openCreate(start: Date, end: Date) {
  if (tasks.value.length === 0) {
    toast('Create a project and a task first, then you can add sessions.')
    return
  }
  draft.value = { end, start, taskId: defaultTaskId ?? taskId }
  dialogOpen.value = true
}

function openEvent(event: CalendarEvent) {
  if (event.isReadOnly) {
    navigateTo(`/sessions/${event.id}`)
    return
  }
  const context = user.value ? findSessionContext(user.value, event.id) : undefined
  if (!context) return
  draft.value = {
    end: context.session.end,
    session: context.session,
    start: context.session.start,
    taskId: context.task.id,
  }
  dialogOpen.value = true
}

function changeEvent(event: CalendarEvent, times: EventTimes) {
  const context = user.value ? findSessionContext(user.value, event.id) : undefined
  if (!context || event.isReadOnly) return

  updateSession({ ...context.session, ...times })
  announcement.value = `Moved ${event.taskName} to ${formatEventTimes({ ...event, ...times })}.`
}

function saveDraft(session: Session, targetTaskId: string) {
  saveSessionToTask(session, targetTaskId)
  toast(draft.value?.session ? 'Session updated.' : 'Session created.')
}

function removeSession(sessionId: string) {
  deleteSession(sessionId)
  toast('Session deleted.')
}
</script>

<template>
  <Card>
    <CardHeader class="gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
      <div class="space-y-1.5">
        <CardTitle :id="headingId" as="h2">{{ title }}</CardTitle>
        <CardDescription v-if="description">{{ description }}</CardDescription>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div
          class="bg-muted text-muted-foreground inline-flex h-10 items-center rounded-md p-1"
          role="group"
          aria-label="Calendar view"
        >
          <button
            v-for="option in CALENDAR_VIEWS"
            :key="option"
            type="button"
            :aria-pressed="view === option"
            :class="
              cn(
                'ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
                view === option && 'bg-background text-foreground shadow-xs',
              )
            "
            @click="selectView(option)"
          >
            {{ VIEW_LABELS[option] }}
          </button>
        </div>
        <Button size="sm" class="gap-1" @click="openNewSession">
          New Session
          <Plus class="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" @click="date = new Date()">Today</Button>
        <Button variant="outline" size="icon" class="h-9 w-9" @click="date = shiftDate(view, date, -1)">
          <ChevronLeft class="h-4 w-4" aria-hidden="true" />
          <span class="sr-only">Previous {{ view === 'schedule' ? 'month' : view }}</span>
        </Button>
        <Button variant="outline" size="icon" class="h-9 w-9" @click="date = shiftDate(view, date, 1)">
          <ChevronRight class="h-4 w-4" aria-hidden="true" />
          <span class="sr-only">Next {{ view === 'schedule' ? 'month' : view }}</span>
        </Button>
        <h3 class="ml-2 text-lg font-semibold" aria-live="polite">{{ viewTitle }}</h3>
      </div>
      <p id="calendar-shortcuts" class="sr-only">
        Press Enter to edit. Press Alt with the arrow keys to move the session, or Alt, Shift and the up or down arrow
        to change its end time.
      </p>
      <CalendarMonthView
        v-if="view === 'month'"
        :date="date"
        :events="events"
        :highlight-id="highlightId"
        :now="now"
        @change="changeEvent"
        @create="openCreate"
        @open="openEvent"
        @select-day="showDay"
      />
      <CalendarScheduleView
        v-else-if="view === 'schedule'"
        :date="date"
        :events="events"
        :highlight-id="highlightId"
        :now="now"
        @open="openEvent"
        @select-day="showDay"
      />
      <CalendarTimeGrid
        v-else
        :key="`${view}-${days[0]?.toISOString()}`"
        :days="days"
        :events="events"
        :highlight-id="highlightId"
        :now="now"
        @change="changeEvent"
        @create="openCreate"
        @open="openEvent"
        @select-day="showDay"
      />
      <p class="sr-only" role="status">{{ announcement }}</p>
    </CardContent>
    <CalendarSessionDialog
      v-model:open="dialogOpen"
      :draft="draft"
      :tasks="tasks"
      @save="saveDraft"
      @delete="removeSession"
    />
  </Card>
</template>
