<script setup lang="ts">
const { dateRange, limit = 7 } = defineProps<{ dateRange: DateRange | undefined; limit?: number }>()
const { user } = useTracker()

const sessions = computed(() => {
  if (!user.value) return []
  const range = dateRange?.from ? dateRange : undefined

  return user.value.projects
    .flatMap((project) => project.tasks.flatMap((task) => task.sessions.map((session) => ({ project, session, task }))))
    .filter(({ session }) => !range || isSessionInDateRange(session, range))
    .sort((a, b) => (b.session.end ?? b.session.start).getTime() - (a.session.end ?? a.session.start).getTime())
    .slice(0, limit)
})
</script>

<template>
  <ul class="space-y-0">
    <li v-for="{ project, session, task } in sessions" :key="session.id">
      <NuxtLink
        :to="`/sessions/${session.id}`"
        class="focus-visible:ring-ring hover:bg-secondary/50 flex cursor-pointer items-center rounded-lg py-4 transition-all duration-300 hover:px-4 focus-visible:ring-2 focus-visible:outline-hidden"
      >
        <Avatar class="h-9 w-9">
          <AvatarFallback>
            <component :is="findOption(flows, session.flow)?.icon" class="h-4 w-4" aria-hidden="true" />
            <span class="sr-only">{{ findOption(flows, session.flow)?.label }} flow</span>
          </AvatarFallback>
        </Avatar>
        <div class="ml-4 min-w-0 space-y-1">
          <p class="truncate text-sm font-medium">{{ project.name }} - {{ task.name }}</p>
          <p class="text-muted-foreground truncate text-sm">{{ getSessionTimeDescription(session) }}</p>
        </div>
        <div class="ml-auto ps-2 font-medium whitespace-nowrap">
          {{ formatDurationShort(getSessionDuration(session)) }}
        </div>
      </NuxtLink>
    </li>
  </ul>
</template>
