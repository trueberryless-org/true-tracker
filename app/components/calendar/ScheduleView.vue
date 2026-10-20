<script setup lang="ts">
import { format, isToday } from 'date-fns'

const { date, events, highlightId, now } = defineProps<{
  date: Date
  events: CalendarEvent[]
  highlightId?: string
  now: Date
}>()
const emit = defineEmits<{ open: [event: CalendarEvent]; selectDay: [day: Date] }>()

const groups = computed(() =>
  getRangeDays(getViewRange('schedule', date))
    .map((day) => ({ day, events: getEventsOnDay(events, day, now) }))
    .filter((group) => group.events.length > 0),
)

function getDuration(event: CalendarEvent) {
  return formatDurationShort((event.end ?? now).getTime() - event.start.getTime())
}
</script>

<template>
  <div class="rounded-md border">
    <p v-if="groups.length === 0" class="text-muted-foreground p-6 text-center text-sm">
      No sessions in {{ format(date, 'MMMM yyyy') }}.
    </p>
    <ol v-else class="divide-y">
      <li
        v-for="group in groups"
        :key="group.day.toISOString()"
        class="grid min-w-0 grid-cols-1 gap-2 p-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4"
      >
        <h3 class="text-sm font-semibold">
          <button
            type="button"
            class="focus-visible:ring-ring flex items-center gap-2 rounded-sm text-left outline-hidden hover:underline focus-visible:ring-2"
            @click="emit('selectDay', group.day)"
          >
            <span
              :class="
                cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  isToday(group.day) && 'bg-primary text-primary-foreground',
                )
              "
            >
              {{ format(group.day, 'd') }}
            </span>
            <span>{{ format(group.day, 'EEEE') }}</span>
          </button>
        </h3>
        <ul class="min-w-0 space-y-1">
          <li v-for="calendarEvent in group.events" :key="calendarEvent.id">
            <button
              type="button"
              :class="
                cn(
                  'hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm outline-hidden focus-visible:ring-2',
                  calendarEvent.id === highlightId && 'bg-accent',
                )
              "
              :aria-label="getEventLabel(calendarEvent)"
              @click="emit('open', calendarEvent)"
            >
              <span
                class="h-2.5 w-2.5 shrink-0 rounded-full"
                :style="{ background: calendarEvent.color }"
                aria-hidden="true"
              />
              <span class="text-muted-foreground w-36 shrink-0 max-sm:hidden">{{
                formatEventTimes(calendarEvent)
              }}</span>
              <span class="min-w-0 flex-1 truncate">
                <span class="font-medium">{{ calendarEvent.taskName }}</span>
                <span class="text-muted-foreground"> · {{ calendarEvent.projectName }}</span>
              </span>
              <OptionLabel
                :options="flows"
                :value="calendarEvent.flow"
                class="text-muted-foreground [&>svg]:text-muted-foreground max-md:hidden"
              />
              <span class="w-24 shrink-0 text-right font-medium whitespace-nowrap tabular-nums">{{
                getDuration(calendarEvent)
              }}</span>
            </button>
          </li>
        </ul>
      </li>
    </ol>
  </div>
</template>
