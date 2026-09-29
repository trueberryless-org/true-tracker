<script setup lang="ts">
useHead({
  script: [{ innerHTML: getColorThemeBootScript(), tagPosition: 'head' }],
  titleTemplate: (title) => title ?? 'Time Tracker',
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster />
</template>
