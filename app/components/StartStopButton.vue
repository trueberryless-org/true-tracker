<script setup lang="ts">
const {
  activeText = 'Stop Tracking',
  inactiveText = 'Start Tracking',
  showElapsedTime = false,
  task,
} = defineProps<{
  activeText?: string
  inactiveText?: string
  showElapsedTime?: boolean
  task: Task
}>()

const now = useSecondTicker()
const runningSession = computed(() => task.sessions.find((session) => !session.end))
const elapsedSeconds = computed(() =>
  runningSession.value ? Math.floor((now.value.getTime() - runningSession.value.start.getTime()) / 1000) : 0,
)
</script>

<template>
  <div class="flex flex-row items-center gap-4">
    <Button
      :aria-label="`${runningSession ? activeText : inactiveText}: ${task.name}`"
      @click="toggleTaskSession(task.id)"
    >
      {{ runningSession ? activeText : inactiveText }}
    </Button>
    <p v-if="runningSession && showElapsedTime" role="timer" aria-live="off">
      •&nbsp;&nbsp;&nbsp;Current Session: {{ formatElapsedSeconds(elapsedSeconds) }}
    </p>
  </div>
</template>
