<script setup lang="ts">
const { id, label, period, picker } = defineProps<{
  id: string
  label: string
  period?: Period
  picker: TimePickerType
}>()
const date = defineModel<Date>('date', { required: true })
const emit = defineEmits<{ left: []; right: [] }>()
const input = useTemplateRef<HTMLInputElement>('input')
const isSecondDigit = ref(false)
const previousKey = ref('0')
let resetTimer: ReturnType<typeof setTimeout> | undefined

const value = computed(() => getDateByType(date.value, picker))

watch(isSecondDigit, (active) => {
  clearTimeout(resetTimer)
  if (active) resetTimer = setTimeout(() => (isSecondDigit.value = false), 2000)
})

onBeforeUnmount(() => clearTimeout(resetTimer))

function getNextValue(key: string) {
  if (picker === '12hours' && isSecondDigit.value && value.value.slice(1, 2) === '1' && previousKey.value === '0') {
    return `0${key}`
  }
  return isSecondDigit.value ? value.value.slice(1, 2) + key : `0${key}`
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Tab') return
  event.preventDefault()

  if (event.key === 'ArrowRight') emit('right')
  if (event.key === 'ArrowLeft') emit('left')
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    isSecondDigit.value = false
    date.value = setDateByType(
      new Date(date.value),
      getArrowByType(value.value, event.key === 'ArrowUp' ? 1 : -1, picker),
      picker,
      period,
    )
  }
  if (event.key >= '0' && event.key <= '9') {
    if (picker === '12hours') previousKey.value = event.key
    const next = getNextValue(event.key)
    if (isSecondDigit.value) emit('right')
    isSecondDigit.value = !isSecondDigit.value
    date.value = setDateByType(new Date(date.value), next, picker, period)
  }
}

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <input
    :id="id"
    ref="input"
    :value="value"
    type="tel"
    inputmode="decimal"
    role="spinbutton"
    :aria-label="label"
    :aria-valuenow="Number(value)"
    :aria-valuetext="value"
    class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring focus:bg-accent focus:text-accent-foreground flex h-10 w-[48px] rounded-md border px-3 py-2 text-center font-mono text-base tabular-nums caret-transparent focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none"
    @keydown="handleKeydown"
  />
</template>
