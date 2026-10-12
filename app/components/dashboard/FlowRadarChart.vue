<script setup lang="ts">
const { class: className, dateRange } = defineProps<{ class?: string; dateRange: DateRange | undefined }>()
const { user } = useTracker()

const series = computed(() => (user.value ? getFlowRadarSeries(user.value, dateRange) : []))
const axes = flows.map((flow) => flow.label)
</script>

<template>
  <Card :class="className">
    <CardHeader class="items-center pb-4">
      <CardTitle as="h2">Session flow per priority</CardTitle>
      <CardDescription>{{ formatRangeText(dateRange) }}</CardDescription>
    </CardHeader>
    <CardContent class="pb-0">
      <ChartRadar
        :axes="axes"
        :series="series"
        :title="`Sessions per flow and task priority, ${formatRangeText(dateRange)}`"
      />
    </CardContent>
    <CardFooter class="flex-col gap-2 text-sm">
      <div class="flex items-center gap-2 leading-none font-medium">{{ getFlowRadarHelperText(series) }}</div>
      <div class="text-muted-foreground flex items-center gap-2 leading-none">
        Showing session grouped by priority of their tasks
      </div>
    </CardFooter>
  </Card>
</template>
