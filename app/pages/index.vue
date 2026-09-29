<script setup lang="ts">
import { Bell, Book, ClipboardCheck, History, Terminal, Workflow } from '@lucide/vue'
import { addWeeks } from 'date-fns'
import { toast } from 'vue-sonner'

const NOTIFICATIONS_READ_KEY = 'notificationsRead'

useHead({ title: 'Dashboard · Time Tracker' })

const { user } = useTracker()
const dateRange = ref<DateRange | undefined>({ from: addWeeks(new Date(), -6), to: new Date() })
const rangePicker = useTemplateRef<{ focus: () => void }>('rangePicker')
const notificationsRead = ref(false)

onMounted(() => {
  notificationsRead.value = readSessionFlag(NOTIFICATIONS_READ_KEY)
})

const hasRange = computed(() => Boolean(dateRange.value?.from))
const range = computed(() => (hasRange.value ? dateRange.value : undefined))
const hasNotifications = computed(() => (user.value ? shouldShowExportNotification(user.value) : false))
const lastWorkingDate = computed(() => {
  if (!user.value) return new Date(Number.NaN)
  return getMostRecentSessionDateOfUser(user.value, dateRange.value?.to ? dateRange.value : undefined)
})

const stats = computed(() => {
  if (!user.value) return null
  return {
    projectInfo: getProjectDurationInfoText(user.value, range.value),
    projectName: getProjectWithMostDuration(user.value, range.value)?.name,
    smoothShare: getSmoothWorkingShare(user.value, range.value),
    taskInfo: getTaskDurationInfoText(user.value, range.value),
    taskName: getTaskWithMostDuration(user.value, range.value)?.name,
    workingTime: formatDurationShort(getWorkingTime(user.value, range.value)),
  }
})

function downloadRange() {
  if (!dateRange.value?.from) {
    toast('Please select a date range first')
    rangePicker.value?.focus()
    return
  }
  downloadCsv(dateRange.value)
}

function markNotificationsRead(value: string | number) {
  if (value !== 'notifications') return
  notificationsRead.value = true
  writeSessionValue(NOTIFICATIONS_READ_KEY, 'true')
}
</script>

<template>
  <LoadingAlert v-if="!user || !stats" />
  <PageContainer v-else>
    <div class="flex-1 space-y-4">
      <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 class="text-4xl font-bold tracking-tight">Dashboard</h1>
        <div class="max-xs:space-y-4 xs:flex-row xs:items-center xs:space-x-2 flex flex-col items-start">
          <DashboardDateRangePicker ref="rangePicker" v-model="dateRange" />
          <Button :disabled="!hasRange" @click="downloadRange">Download</Button>
        </div>
      </div>
      <Tabs default-value="overview" class="space-y-4" @update:model-value="markNotificationsRead">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notifications">
            <div class="flex items-center space-x-2">
              <span>Notifications</span>
              <template v-if="hasNotifications">
                <Bell :class="cn('h-4 w-4', !notificationsRead && 'text-primary')" aria-hidden="true" />
                <span class="sr-only">(new)</span>
              </template>
            </div>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" class="mt-0 space-y-4">
          <div class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle as="h3" class="text-primary text-sm font-medium">Working Time</CardTitle>
                  <Workflow class="text-muted-foreground h-4 w-4" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">{{ stats.workingTime }}</div>
                  <p class="text-muted-foreground text-xs">{{ stats.smoothShare }}% working really smooth</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle as="h3" class="text-primary text-sm font-medium">Most common project</CardTitle>
                  <Book class="text-muted-foreground h-4 w-4" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">{{ stats.projectName }}</div>
                  <p class="text-muted-foreground text-xs">{{ stats.projectInfo }}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle as="h3" class="text-primary text-sm font-medium">Most common task</CardTitle>
                  <ClipboardCheck class="text-muted-foreground h-4 w-4" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">{{ stats.taskName }}</div>
                  <p class="text-muted-foreground text-xs">{{ stats.taskInfo }}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle as="h3" class="text-primary text-sm font-medium">
                    Last time working {{ dateRange?.to ? 'in given interval' : '' }}
                  </CardTitle>
                  <History class="text-muted-foreground h-4 w-4" aria-hidden="true" />
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">{{ formatNiceDate(lastWorkingDate) }}</div>
                  <p class="text-muted-foreground text-xs">{{ formatDateToDistanceFromNow(lastWorkingDate) }}</p>
                </CardContent>
              </Card>
            </div>
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-6 xl:grid-cols-7">
              <DashboardTaskAmountChart :date-range="range" class="order-1 lg:col-span-2" />
              <Card class="order-2 overflow-hidden md:col-span-2 md:max-lg:order-3 lg:col-span-4 xl:col-span-3">
                <CardHeader>
                  <CardTitle as="h3">Recent Tasks</CardTitle>
                  <CardDescription>{{ getRecentTasksInfoText(user, range) }}</CardDescription>
                </CardHeader>
                <CardContent>
                  <DashboardRecentTasks :date-range="range" :limit="6" />
                </CardContent>
              </Card>
              <DashboardFlowRadarChart
                :date-range="range"
                class="order-3 md:order-2 lg:order-4 lg:col-span-2 xl:order-3"
              />
              <Card class="order-4 overflow-hidden md:col-span-2 lg:col-span-4 lg:max-xl:order-3 xl:col-span-3">
                <CardHeader>
                  <CardTitle as="h3">Recent Sessions</CardTitle>
                  <CardDescription>{{ getRecentSessionsInfoText(user, range) }}</CardDescription>
                </CardHeader>
                <CardContent>
                  <DashboardRecentSessions :date-range="range" />
                </CardContent>
              </Card>
              <DashboardVisitsChart class="order-5 md:col-span-2 lg:col-span-6 xl:col-span-4" />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="notifications" class="mt-0 space-y-4">
          <Card v-if="!hasNotifications" class="col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle as="h3">Feels lonely here</CardTitle>
              <CardDescription>
                You have no notifications. If you had notifications, there would be a
                <Bell class="inline-block h-4 w-4" aria-label="bell" />
                icon right next to the &quot;Notifications&quot; tab.
              </CardDescription>
            </CardHeader>
          </Card>
          <Alert v-if="hasNotifications" class="mb-12">
            <Terminal class="h-4 w-4" aria-hidden="true" />
            <AlertTitle>Notification!</AlertTitle>
            <AlertDescription>
              We recommend exporting your data regularly. Head to Settings → Data Management to export your data now.
              Stay safe!
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  </PageContainer>
</template>
