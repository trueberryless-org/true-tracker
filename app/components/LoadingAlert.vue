<script setup lang="ts">
import { AlertCircle } from '@lucide/vue'

const { isAccount } = useTracker()
</script>

<template>
  <PageContainer>
    <Alert variant="default">
      <AlertCircle class="h-4 w-4" aria-hidden="true" />
      <AlertTitle>Loading...</AlertTitle>
      <AlertDescription>
        {{
          isAccount
            ? 'We are currently trying to fetch your data from your ATproto repository.'
            : 'We are currently trying to fetch your data from your local storage.'
        }}
      </AlertDescription>
    </Alert>
  </PageContainer>
</template>
