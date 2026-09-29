<script setup lang="ts">
import { AlertCircle } from '@lucide/vue'

const { entity, backTo } = defineProps<{ backTo: string; entity: string }>()
</script>

<template>
  <PageContainer>
    <Alert variant="destructive">
      <AlertCircle class="h-4 w-4" aria-hidden="true" />
      <AlertTitle>Not found</AlertTitle>
      <AlertDescription>
        This {{ entity }} does not exist (anymore).
        <NuxtLink :to="backTo" class="font-medium underline underline-offset-4">Go back to all {{ entity }}s.</NuxtLink>
      </AlertDescription>
    </Alert>
  </PageContainer>
</template>
