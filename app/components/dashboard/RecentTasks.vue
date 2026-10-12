<script setup lang="ts">
const { dateRange, limit = 7 } = defineProps<{ dateRange: DateRange | undefined; limit?: number }>()
const { user } = useTracker()

const tasks = computed(() => {
  if (!user.value) return []
  const range = dateRange?.from ? dateRange : undefined

  return user.value.projects
    .flatMap((project) => project.tasks.map((task) => ({ project, task })))
    .filter(({ task }) => !range || task.sessions.some((session) => isSessionInDateRange(session, range)))
    .sort(
      (a, b) =>
        getMostRecentSessionDateOfTask(b.task, range).getTime() -
        getMostRecentSessionDateOfTask(a.task, range).getTime(),
    )
    .slice(0, limit)
})
</script>

<template>
  <ul class="space-y-0">
    <li
      v-for="{ project, task } in tasks"
      :key="task.id"
      class="focus-within:ring-ring hover:bg-secondary/50 relative flex cursor-pointer items-center rounded-lg py-4 transition-all duration-300 focus-within:ring-2 hover:px-4"
    >
      <NuxtLink
        :to="`/tasks/${task.id}`"
        class="flex min-w-0 flex-1 items-center outline-hidden after:absolute after:inset-0 after:content-['']"
      >
        <Avatar class="h-9 w-9">
          <AvatarFallback>
            <component :is="findOption(priorities, task.priority)?.icon" class="h-4 w-4" aria-hidden="true" />
            <span class="sr-only">{{ findOption(priorities, task.priority)?.label }} priority</span>
          </AvatarFallback>
        </Avatar>
        <div class="ml-4 min-w-0 space-y-1">
          <p class="truncate text-sm leading-none font-medium">{{ project.name }} - {{ task.name }}</p>
          <div class="text-muted-foreground truncate text-sm">
            <OptionLabel :options="taskStatuses" :value="task.status" />
          </div>
        </div>
      </NuxtLink>
      <div class="relative z-10 ml-auto hidden ps-2 font-medium md:inline-block">
        <StartStopButton :task="task" />
      </div>
    </li>
  </ul>
</template>
