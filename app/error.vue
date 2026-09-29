<script setup lang="ts">
import { AlertCircle } from '@lucide/vue'
import type { NuxtError } from '#app'

const { error } = defineProps<{ error: NuxtError }>()

useHead({ title: `${error.statusCode === 404 ? 'Page not found' : 'Error'} · Time Tracker` })
</script>

<template>
  <main class="bg-muted/40 flex min-h-screen items-center justify-center p-4">
    <Alert variant="destructive" class="max-w-lg">
      <AlertCircle class="h-4 w-4" aria-hidden="true" />
      <AlertTitle>{{ error.statusCode === 404 ? 'Page not found' : 'Something went wrong' }}</AlertTitle>
      <AlertDescription>
        <p>{{ error.statusCode === 404 ? 'This page does not exist.' : error.message }}</p>
        <Button variant="link" class="h-auto px-0" @click="clearError({ redirect: '/' })">Go to the dashboard</Button>
      </AlertDescription>
    </Alert>
  </main>
</template>
