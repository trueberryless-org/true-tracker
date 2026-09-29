<script setup lang="ts">
import { TrendingDown, TrendingUp } from '@lucide/vue'

const { class: className } = defineProps<{ class?: string }>()
const { user } = useTracker()

const views = computed(() => {
  if (!user.value) return []
  return [
    { chart: getVisitsByWeekday(user.value), description: 'Grouped by weekday', group: 'weekday', value: 'week' },
    { chart: getVisitsByMonth(user.value), description: 'Grouped by month', group: 'month', value: 'month' },
    { chart: getVisitsByYear(user.value), description: 'Grouped by year', group: 'year', value: 'year' },
  ]
})
</script>

<template>
  <Tabs default-value="week" :class="cn(className, 'mt-0')">
    <TabsContent v-for="view in views" :key="view.value" :value="view.value" class="mt-0 h-full">
      <Card class="flex h-full flex-col justify-between">
        <CardHeader class="flex flex-row justify-between">
          <div class="space-y-1.5">
            <CardTitle as="h3">Visits</CardTitle>
            <CardDescription>{{ view.description }}</CardDescription>
          </div>
          <TabsList class="right-0" aria-label="Group visits by">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <ChartBar
            :data="view.chart.data"
            color="hsl(var(--chart-1))"
            series-label="Visits"
            :label-threshold="view.chart.average / 3"
            :title="`Visits grouped by ${view.group}`"
          />
        </CardContent>
        <CardFooter class="flex-col items-start gap-2 text-sm">
          <div class="flex gap-2 leading-none font-medium">
            {{ formatVisitPercentage(view.chart.current, view.chart.average) }} {{ view.chart.periodText }}
            <TrendingUp v-if="view.chart.current / view.chart.average >= 1" class="h-4 w-4" aria-hidden="true" />
            <TrendingDown v-if="view.chart.current / view.chart.average < 1" class="h-4 w-4" aria-hidden="true" />
          </div>
          <div class="text-muted-foreground leading-none">
            Showing all your visits of this website grouped by {{ view.group }}.
          </div>
        </CardFooter>
      </Card>
    </TabsContent>
  </Tabs>
</template>
