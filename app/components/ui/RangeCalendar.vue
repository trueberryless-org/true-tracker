<script setup lang="ts">
import { type DateValue, getLocalTimeZone } from '@internationalized/date'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import {
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
  RangeCalendarNext,
  RangeCalendarPrev,
  RangeCalendarRoot,
} from 'reka-ui'

const { numberOfMonths = 2 } = defineProps<{ numberOfMonths?: number }>()
const model = defineModel<DateRange | undefined>()
const placeholder = defineModel<DateValue>('placeholder')

const calendarValue = computed(() => {
  if (!model.value?.from) return undefined
  return {
    end: model.value.to ? dateToCalendarDate(model.value.to) : undefined,
    start: dateToCalendarDate(model.value.from),
  }
})

function updateRange(range: { end?: DateValue; start?: DateValue } | undefined) {
  if (!range?.start) {
    model.value = undefined
    return
  }
  model.value = {
    from: range.start.toDate(getLocalTimeZone()),
    to: range.end?.toDate(getLocalTimeZone()),
  }
}

function updateStart(start: DateValue | undefined) {
  if (start) model.value = { from: start.toDate(getLocalTimeZone()), to: undefined }
}

function formatMonth(date: DateValue) {
  return date.toDate(getLocalTimeZone()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const navButtonClass = cn(
  buttonVariants({ variant: 'outline' }),
  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
)
const dayClass = cn(
  buttonVariants({ variant: 'ghost' }),
  'h-9 w-9 p-0 font-normal',
  'data-[today]:not-data-[selected]:bg-accent data-[today]:not-data-[selected]:text-accent-foreground',
  'data-[selected]:bg-accent data-[selected]:text-accent-foreground',
  'data-[selection-start]:bg-primary data-[selection-start]:text-primary-foreground data-[selection-start]:hover:bg-primary data-[selection-start]:hover:text-primary-foreground data-[selection-start]:focus:bg-primary data-[selection-start]:focus:text-primary-foreground',
  'data-[selection-end]:bg-primary data-[selection-end]:text-primary-foreground data-[selection-end]:hover:bg-primary data-[selection-end]:hover:text-primary-foreground data-[selection-end]:focus:bg-primary data-[selection-end]:focus:text-primary-foreground',
  'data-[outside-view]:text-muted-foreground data-[outside-view]:opacity-50 data-[outside-view]:data-[selected]:bg-accent/50 data-[outside-view]:data-[selected]:text-muted-foreground data-[outside-view]:data-[selected]:opacity-30',
  'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
)
</script>

<template>
  <RangeCalendarRoot
    v-slot="{ grid, weekDays }"
    v-model:placeholder="placeholder"
    :model-value="calendarValue"
    :number-of-months="numberOfMonths"
    locale="en-US"
    weekday-format="short"
    initial-focus
    class="p-3"
    @update:model-value="updateRange"
    @update:start-value="updateStart"
  >
    <div class="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
      <div v-for="(month, index) in grid" :key="month.value.toString()" class="space-y-4">
        <div class="relative flex items-center justify-center pt-1">
          <div class="text-sm font-medium" aria-live="polite">{{ formatMonth(month.value) }}</div>
          <div class="flex items-center space-x-1">
            <RangeCalendarPrev v-if="index === 0" :class="cn(navButtonClass, 'absolute left-1')">
              <ChevronLeft class="h-4 w-4" aria-hidden="true" />
            </RangeCalendarPrev>
            <RangeCalendarNext v-if="index === grid.length - 1" :class="cn(navButtonClass, 'absolute right-1')">
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </RangeCalendarNext>
          </div>
        </div>
        <RangeCalendarGrid class="w-full border-collapse space-y-1">
          <RangeCalendarGridHead>
            <RangeCalendarGridRow class="flex">
              <RangeCalendarHeadCell
                v-for="day in weekDays"
                :key="day"
                class="text-muted-foreground w-9 rounded-md text-[0.8rem] font-normal"
              >
                {{ day.slice(0, 2) }}
              </RangeCalendarHeadCell>
            </RangeCalendarGridRow>
          </RangeCalendarGridHead>
          <RangeCalendarGridBody>
            <RangeCalendarGridRow
              v-for="(week, weekIndex) in month.rows"
              :key="`week-${weekIndex}`"
              class="mt-2 flex w-full"
            >
              <RangeCalendarCell
                v-for="day in week"
                :key="day.toString()"
                :date="day"
                class="[&:has([data-outside-view][data-selected])]:bg-accent/50 [&:has([data-selected])]:bg-accent relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 first:[&:has([data-selected])]:rounded-l-md last:[&:has([data-selected])]:rounded-r-md [&:has([data-selection-end])]:rounded-r-md"
              >
                <RangeCalendarCellTrigger :day="day" :month="month.value" :class="dayClass" />
              </RangeCalendarCell>
            </RangeCalendarGridRow>
          </RangeCalendarGridBody>
        </RangeCalendarGrid>
      </div>
    </div>
  </RangeCalendarRoot>
</template>
