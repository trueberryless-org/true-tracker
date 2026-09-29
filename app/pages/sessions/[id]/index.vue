<script setup lang="ts">
import { Activity, Book, ChevronLeft, ClipboardCheck, Clock9 } from '@lucide/vue'

const route = useRoute()
const { loaded, user } = useTracker()
const now = useSecondTicker()
const sessionId = computed(() => String(route.params.id))
const context = computed(() => (user.value ? findSessionContext(user.value, sessionId.value) : undefined))
const isArchived = computed(() => isProjectArchived(context.value?.project))
const duration = computed(() => (context.value ? getSessionDuration(context.value.session, now.value.getTime()) : 0))
const title = computed(() => `${formatDurationFitting(duration.value)} session`)

useHead(() => ({ title: `${title.value} · Time Tracker` }))
</script>

<template>
  <LoadingAlert v-if="!loaded || !user" />
  <NotFoundAlert v-else-if="!context" entity="session" back-to="/sessions" />
  <PageContainer v-else>
    <div class="flex min-h-9 items-center gap-4 overflow-hidden">
      <Button as-child variant="outline" size="icon" class="text-muted-foreground h-7 w-7 shrink-0">
        <NuxtLink to="/sessions">
          <ChevronLeft class="h-4 w-4" aria-hidden="true" />
          <span class="sr-only">Back to sessions</span>
        </NuxtLink>
      </Button>
      <h1 class="truncate text-xl font-semibold tracking-tight">{{ title }}</h1>
      <Badge variant="outline" class="bg-background ml-auto py-2 max-sm:hidden sm:ml-0">
        <OptionLabel :options="flows" :value="context.session.flow" class="text-muted-foreground" />
      </Badge>
      <div class="ml-auto flex items-center gap-2">
        <Button v-if="!isArchived" as-child size="sm">
          <NuxtLink :to="`/sessions/${context.session.id}/edit`">Edit Session</NuxtLink>
        </Button>
        <Button v-else size="sm" disabled>Edit Session</Button>
      </div>
    </div>
    <section aria-label="Session overview" class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card class="focus-within:ring-ring relative cursor-pointer focus-within:ring-2">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary text-sm font-medium">Project</CardTitle>
          <Book class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <NuxtLink
            :to="`/projects/${context.project.id}`"
            class="text-2xl font-bold outline-hidden after:absolute after:inset-0 after:content-['']"
          >
            {{ context.project.name }}
          </NuxtLink>
          <p class="text-muted-foreground text-xs">Click to go to project.</p>
        </CardContent>
      </Card>
      <Card class="focus-within:ring-ring relative cursor-pointer focus-within:ring-2">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary text-sm font-medium">Task</CardTitle>
          <ClipboardCheck class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <NuxtLink
            :to="`/tasks/${context.task.id}`"
            class="text-2xl font-bold outline-hidden after:absolute after:inset-0 after:content-['']"
          >
            {{ context.task.name }}
          </NuxtLink>
          <p class="text-muted-foreground text-xs">Click to go to task.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary text-sm font-medium">Duration</CardTitle>
          <Clock9 class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatDurationShort(duration) }}</div>
          <p class="text-muted-foreground text-xs">
            {{ getDurationComparison(user, context.session, now.getTime()) }}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle as="h2" class="text-primary text-sm font-medium">Flow</CardTitle>
          <Activity class="text-muted-foreground h-4 w-4" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold"><OptionLabel :options="flows" :value="context.session.flow" /></div>
          <p class="text-muted-foreground text-xs">{{ getFlowComparison(user, context.session.flow) }}</p>
        </CardContent>
      </Card>
    </section>
    <CalendarSessionCalendar
      :highlight-id="context.session.id"
      :initial-date="context.session.start"
      :default-task-id="isArchived ? undefined : context.task.id"
      description="This session and everything around it. Click or drag in the calendar to add, move or resize sessions."
    />
  </PageContainer>
</template>
