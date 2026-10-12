<script setup lang="ts">
import { ChevronLeft } from '@lucide/vue'

const route = useRoute()
const { isAccount, loaded, user } = useTracker()
const projectId = computed(() => String(route.params.id))
const stored = computed(() => user.value?.projects.find((p) => p.id === projectId.value))
const project = ref<Project | null>(null)
const archiveDialogOpen = ref(false)
const deleteDialogOpen = ref(false)

useHead(() => ({ title: `Edit ${stored.value?.name ?? 'Project'} · Time Tracker` }))

watch(
  stored,
  (value) => {
    if (value && !project.value) project.value = structuredClone(toRaw(value))
  },
  { immediate: true },
)

function saveProject() {
  if (!project.value) return
  updateProject(project.value)
  navigateTo(`/projects/${project.value.id}`)
}

function removeProject() {
  deleteProject(projectId.value)
  navigateTo('/projects')
}

function archive() {
  archiveProject(projectId.value)
  navigateTo(`/projects/${projectId.value}`)
}
</script>

<template>
  <LoadingAlert v-if="!loaded || !user" />
  <NotFoundAlert v-else-if="!stored || !project" entity="project" back-to="/projects" />
  <ArchivedAlert v-else-if="stored.archivedAt">
    This project has been archived. Please unarchive the project again, by clicking the button in the top right of the
    project view!
  </ArchivedAlert>
  <PageContainer v-else>
    <form class="contents" @submit.prevent="saveProject">
      <div class="flex min-h-9 items-center gap-4 overflow-hidden">
        <Button as-child variant="outline" size="icon" class="text-muted-foreground h-7 w-7 shrink-0">
          <NuxtLink :to="`/projects/${project.id}`">
            <ChevronLeft class="h-4 w-4" aria-hidden="true" />
            <span class="sr-only">Back to project</span>
          </NuxtLink>
        </Button>
        <h1 class="truncate text-xl font-semibold tracking-tight">{{ project.name }}</h1>
        <Badge variant="outline" class="bg-background max-xs:hidden ml-auto py-2 sm:ml-0">
          <OptionLabel :options="priorities" :value="project.priority" class="text-muted-foreground" />
        </Badge>
        <Badge variant="outline" class="bg-background ml-auto py-2 max-sm:hidden sm:ml-0">
          <OptionLabel :options="projectStatuses" :value="project.status" class="text-muted-foreground" />
        </Badge>
        <div class="flex items-center gap-2 max-md:hidden md:ml-auto">
          <ProjectOtherActions @archive="archiveDialogOpen = true" @delete="deleteDialogOpen = true" />
          <Button as-child variant="outline" size="sm" class="text-muted-foreground">
            <NuxtLink :to="`/projects/${project.id}`">Discard</NuxtLink>
          </Button>
          <Button type="submit" size="sm">Save Project</Button>
        </div>
      </div>
      <ProjectForm v-model="project">
        <template #status-info>We help you automate project flows.</template>
      </ProjectForm>
      <div class="flex items-center justify-end gap-2 md:hidden">
        <ProjectOtherActions short @archive="archiveDialogOpen = true" @delete="deleteDialogOpen = true" />
        <Button as-child variant="outline" size="sm" class="text-muted-foreground">
          <NuxtLink :to="`/projects/${project.id}`">Discard</NuxtLink>
        </Button>
        <Button type="submit" size="sm">Save Project</Button>
      </div>
    </form>
    <ConfirmDialog v-model:open="archiveDialogOpen" @confirm="archive">
      This will archive your project {{ project.name }}. Archived projects can no longer be edited until you unarchive
      them again from the project view.
    </ConfirmDialog>
    <ConfirmDialog v-model:open="deleteDialogOpen" @confirm="removeProject">
      This action cannot be undone. This will permanently delete your project {{ project.name }} and remove this data
      from your {{ isAccount ? 'account' : 'local storage' }}.
    </ConfirmDialog>
  </PageContainer>
</template>
