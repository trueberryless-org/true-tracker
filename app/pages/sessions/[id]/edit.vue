<script setup lang="ts">
import { ChevronLeft } from '@lucide/vue'

const route = useRoute()
const { isAccount, loaded, user } = useTracker()
const sessionId = computed(() => String(route.params.id))
const context = computed(() => (user.value ? findSessionContext(user.value, sessionId.value) : undefined))
const session = ref<Session | null>(null)
const deleteDialogOpen = ref(false)
const title = computed(() => {
  const current = session.value
  const duration = current?.end ? current.end.getTime() - current.start.getTime() : 0
  return `${formatDurationFitting(duration)} session`
})

useHead(() => ({ title: `Edit ${title.value} · Time Tracker` }))

watch(
  context,
  (value) => {
    if (value && !session.value) session.value = structuredClone(toRaw(value.session))
  },
  { immediate: true },
)

function saveSession() {
  if (!session.value) return
  updateSession(session.value)
  navigateTo(`/sessions/${session.value.id}`)
}

function removeSession() {
  deleteSession(sessionId.value)
  navigateTo('/sessions')
}
</script>

<template>
  <LoadingAlert v-if="!loaded || !user" />
  <NotFoundAlert v-else-if="!context || !session" entity="session" back-to="/sessions" />
  <ArchivedAlert v-else-if="context.project.archivedAt">
    This task belongs to a project that has been archived. Please unarchive the project again, by clicking the button in
    the top right of the project view!
  </ArchivedAlert>
  <PageContainer v-else>
    <form class="contents" @submit.prevent="saveSession">
      <div class="flex min-h-9 items-center gap-4 overflow-hidden">
        <Button as-child variant="outline" size="icon" class="text-muted-foreground h-7 w-7 shrink-0">
          <NuxtLink :to="`/sessions/${session.id}`">
            <ChevronLeft class="h-4 w-4" aria-hidden="true" />
            <span class="sr-only">Back to session</span>
          </NuxtLink>
        </Button>
        <h1 class="truncate text-xl font-semibold tracking-tight">{{ title }}</h1>
        <Badge v-if="session.flow" variant="outline" class="bg-background ml-auto py-2 sm:ml-0">
          <OptionLabel :options="flows" :value="session.flow" class="text-muted-foreground" />
        </Badge>
        <div class="flex items-center gap-2 max-md:hidden md:ml-auto">
          <Button variant="destructive" size="sm" @click="deleteDialogOpen = true">Delete</Button>
          <Button as-child variant="outline" size="sm" class="text-muted-foreground">
            <NuxtLink :to="`/sessions/${session.id}`">Discard</NuxtLink>
          </Button>
          <Button type="submit" size="sm">Save Session</Button>
        </div>
      </div>
      <SessionForm v-model="session" />
      <div class="flex items-center justify-end gap-2 md:hidden">
        <Button variant="destructive" size="sm" @click="deleteDialogOpen = true">Delete</Button>
        <Button as-child variant="outline" size="sm" class="text-muted-foreground">
          <NuxtLink :to="`/sessions/${session.id}`">Discard</NuxtLink>
        </Button>
        <Button type="submit" size="sm">Save Session</Button>
      </div>
    </form>
    <ConfirmDialog v-model:open="deleteDialogOpen" @confirm="removeSession">
      This action cannot be undone. This will permanently delete this session and remove this data from your
      {{ isAccount ? 'account' : 'local storage' }}.
    </ConfirmDialog>
  </PageContainer>
</template>
