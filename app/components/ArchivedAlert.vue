<script setup lang="ts">
import { AlertCircle } from '@lucide/vue'
</script>

<template>
  <PageContainer>
    <Alert variant="destructive">
      <AlertCircle class="h-4 w-4" aria-hidden="true" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <slot />
      </AlertDescription>
    </Alert>
  </PageContainer>
</template>
