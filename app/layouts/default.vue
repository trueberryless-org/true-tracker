<script setup lang="ts">
const { loaded, user } = useTracker()
const hydrated = useHydrated()
const main = useTemplateRef<HTMLElement>('main')

function skipToContent(event: MouseEvent) {
  event.preventDefault()
  main.value?.focus()
  main.value?.scrollIntoView({ block: 'start' })
}
</script>

<template>
  <div v-if="!hydrated || !loaded" class="bg-muted/40 min-h-screen" aria-busy="true">
    <span class="sr-only" role="status">Loading Time Tracker…</span>
  </div>
  <SignUp v-else-if="!user" />
  <div v-else>
    <a href="#main-content" class="skip-link" @click="skipToContent">Skip to content</a>
    <TheNavbar />
    <main id="main-content" ref="main" tabindex="-1" class="focus:outline-hidden">
      <slot />
    </main>
    <ExitTestMode v-if="user.isCurrentlyInTestMode" />
  </div>
</template>
