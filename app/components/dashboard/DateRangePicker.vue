<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { CalendarIcon } from '@lucide/vue'
import { addMonths, format } from 'date-fns'

const model = defineModel<DateRange | undefined>()
const trigger = useTemplateRef<{ $el: HTMLElement }>('trigger')
const placeholder = shallowRef<DateValue>(
  dateToCalendarDate(addMonths(model.value?.to ?? model.value?.from ?? new Date(), -1)),
)

const label = computed(() => {
  const { from, to } = model.value ?? {}
  if (!from) return null
  return to ? `${format(from, 'LLL dd, y')} - ${format(to, 'LLL dd, y')}` : format(from, 'LLL dd, y')
})

function focus() {
  trigger.value?.$el.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="grid gap-2">
    <Popover>
      <PopoverTrigger as-child>
        <Button
          id="date"
          ref="trigger"
          variant="outline"
          :aria-label="label ? `Date range: ${label}` : 'Pick a date range'"
          :class="
            cn(
              'w-[260px] justify-start text-left font-normal',
              !model && 'text-muted-foreground',
              'focus:ring-ring focus:ring-offset-background focus:ring-2 focus:ring-offset-2 focus:outline-hidden',
            )
          "
        >
          <CalendarIcon class="mr-2 h-4 w-4" aria-hidden="true" />
          <span v-if="label">{{ label }}</span>
          <span v-else>Pick a date</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="end">
        <RangeCalendar v-model="model" v-model:placeholder="placeholder" :number-of-months="2" />
      </PopoverContent>
    </Popover>
  </div>
</template>
