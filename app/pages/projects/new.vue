<script setup lang="ts">
useHead({ title: 'New Project · Time Tracker' })

const { user } = useTracker()
const project = ref<Project>(createProject())

function saveProject() {
  addProject(project.value)
  navigateTo(`/projects/${project.value.id}`)
}
</script>

<template>
  <LoadingAlert v-if="!user" />
  <PageContainer v-else>
    <form class="grid flex-1 auto-rows-max gap-4" @submit.prevent="saveProject">
      <div class="flex items-center gap-4">
        <h1 class="flex-1 shrink-0 text-xl font-semibold tracking-tight whitespace-nowrap sm:grow-0">
          {{ project.name || 'New Project' }}
        </h1>
        <Badge variant="outline" class="bg-background ml-auto py-2 sm:ml-0">
          <OptionLabel :options="priorities" :value="project.priority" class="text-muted-foreground" />
        </Badge>
        <Badge variant="outline" class="bg-background ml-auto py-2 sm:ml-0">
          <OptionLabel :options="projectStatuses" :value="project.status" class="text-muted-foreground" />
        </Badge>
        <div class="hidden items-center gap-2 md:ml-auto md:flex">
          <Button as-child variant="outline" size="sm" class="text-muted-foreground">
            <NuxtLink to="/projects">Discard</NuxtLink>
          </Button>
          <Button type="submit" size="sm">Save Project</Button>
        </div>
      </div>
      <ProjectForm v-model="project">
        <template #status-info>
          We try to automate this status in order to help you focus on your projects, not this app.
        </template>
      </ProjectForm>
      <div class="flex items-center justify-end gap-2 md:hidden">
        <Button as-child variant="outline" size="sm" class="text-muted-foreground">
          <NuxtLink to="/projects">Discard</NuxtLink>
        </Button>
        <Button type="submit" size="sm">Save Project</Button>
      </div>
    </form>
  </PageContainer>
</template>
