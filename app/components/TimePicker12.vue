<script setup lang="ts">
const { label } = defineProps<{ label: string }>()
const date = defineModel<Date>('date', { required: true })
const id = useId()
const period = ref<Period>(getPeriod(date.value))
const hours = useTemplateRef<{ focus: () => void }>('hours')
const minutes = useTemplateRef<{ focus: () => void }>('minutes')
const seconds = useTemplateRef<{ focus: () => void }>('seconds')
const periodTrigger = useTemplateRef<{ $el: HTMLElement }>('periodTrigger')

const periodValue = computed({
  get: () => period.value,
  set: (value: Period) => {
    period.value = value
    date.value = setDateByType(new Date(date.value), display12HourValue(date.value.getHours()), '12hours', value)
  },
})

function handlePeriodKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') seconds.value?.focus()
}
</script>

<template>
  <fieldset class="flex items-end gap-2">
    <legend class="sr-only">{{ label }}</legend>
    <div class="grid gap-1 text-center">
      <Label :for="`${id}-hours`" class="text-xs">Hours</Label>
      <TimePickerInput
        :id="`${id}-hours`"
        ref="hours"
        v-model:date="date"
        picker="12hours"
        :period="period"
        :label="`${label} hours`"
        @right="minutes?.focus()"
      />
    </div>
    <div class="grid gap-1 text-center">
      <Label :for="`${id}-minutes`" class="text-xs">Minutes</Label>
      <TimePickerInput
        :id="`${id}-minutes`"
        ref="minutes"
        v-model:date="date"
        picker="minutes"
        :label="`${label} minutes`"
        @left="hours?.focus()"
        @right="seconds?.focus()"
      />
    </div>
    <div class="grid gap-1 text-center">
      <Label :for="`${id}-seconds`" class="text-xs">Seconds</Label>
      <TimePickerInput
        :id="`${id}-seconds`"
        ref="seconds"
        v-model:date="date"
        picker="seconds"
        :label="`${label} seconds`"
        @left="minutes?.focus()"
        @right="periodTrigger?.$el.focus()"
      />
    </div>
    <div class="grid gap-1 text-center">
      <Label :for="`${id}-period`" class="text-xs">Period</Label>
      <div class="flex h-10 items-center">
        <Select v-model="periodValue">
          <SelectTrigger
            :id="`${id}-period`"
            ref="periodTrigger"
            class="focus:bg-accent focus:text-accent-foreground w-[65px]"
            @keydown="handlePeriodKeydown"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </fieldset>
</template>
