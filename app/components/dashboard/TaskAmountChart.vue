<script setup lang="ts">
const { class: className, dateRange } = defineProps<{ class?: string; dateRange: DateRange | undefined }>()
const { user } = useTracker()

const data = computed(() => (user.value ? getTaskAmountChartData(user.value, dateRange) : []))
const total = computed(() => data.value.reduce((sum, slice) => sum + slice.value, 0))
const shownProjects = computed(() => data.value.filter((slice) => slice.value !== 0).length)
</script>

<template>
  <Card :class="cn(className, 'flex flex-col')">
    <CardHeader class="items-center pb-0">
      <CardTitle as="h2">Active Tasks per project</CardTitle>
      <CardDescription>{{ formatRangeText(dateRange) }}</CardDescription>
    </CardHeader>
    <CardContent class="flex-1 pb-0">
      <ChartDonut
        :data="data"
        :center-value="total.toLocaleString()"
        center-label="Tasks"
        :title="`Active tasks per project, ${formatRangeText(dateRange)}`"
      />
    </CardContent>
    <CardFooter class="flex-col gap-2 text-sm">
      <div class="flex items-center gap-2 leading-none font-medium">{{ getTaskAmountHelperText(data) }}</div>
      <div class="text-muted-foreground leading-none">
        Showing top {{ shownProjects }} project{{ shownProjects === 1 ? '' : 's' }}
      </div>
    </CardFooter>
  </Card>
</template>
