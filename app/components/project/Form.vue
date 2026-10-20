<script setup lang="ts">
const project = defineModel<Project>({ required: true })
</script>

<template>
  <div class="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
    <div class="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
      <Card>
        <CardHeader>
          <CardTitle as="h2">Project Details</CardTitle>
          <CardDescription>Edit the name and description of the project.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-6">
            <div class="grid gap-3">
              <Label for="project-id">Identifier</Label>
              <Input id="project-id" :model-value="project.id" class="w-full" disabled />
            </div>
            <div class="grid gap-3">
              <Label for="project-name">Name</Label>
              <Input id="project-name" v-model="project.name" class="w-full" required />
            </div>
            <div class="grid gap-3">
              <Label for="project-description">Description</Label>
              <Textarea id="project-description" v-model="project.description" class="min-h-36" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    <div class="grid auto-rows-max items-start gap-4 lg:gap-8">
      <Card>
        <CardHeader>
          <CardTitle as="h2">
            <div class="flex items-center justify-between">
              <div>Project Status</div>
              <InfoHoverCard label="About the project status">
                <slot name="status-info" />
              </InfoHoverCard>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-6">
            <div class="grid gap-3">
              <Label for="project-status">Status</Label>
              <Select v-model="project.status">
                <SelectTrigger id="project-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="status in projectStatuses" :key="status.value" :value="status.value">
                    <OptionLabel :options="projectStatuses" :value="status.value" />
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle as="h2">Project Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid gap-6">
            <div class="grid gap-3">
              <Label for="project-priority">Priority</Label>
              <Select v-model="project.priority">
                <SelectTrigger id="project-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="priority in priorities" :key="priority.value" :value="priority.value">
                    <OptionLabel :options="priorities" :value="priority.value" />
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
