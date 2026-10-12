<script setup lang="ts">
import { AtSign } from '@lucide/vue'
import { toast } from 'vue-sonner'

const authUser = useAuthUser()
const { lastError, spaceAccess, status, target } = useSyncState()
const handle = ref('')
const signingIn = ref(false)
const signInError = ref<string | null>(null)
const switchingStorage = ref(false)
const online = useOnline()

const storageDescription = computed(() => {
  if (target.value === 'vault') return 'Your data is stored in a private space in your ATproto repository.'
  if (target.value === 'public') return 'Your data is stored as public records in your ATproto repository.'
  if (target.value === 'device' && spaceAccess.value === 'denied') {
    return 'Your account did not grant access to the private space, so your data stays on this device for now.'
  }
  if (target.value === 'device') {
    return 'Your PDS does not support private spaces yet, so your data stays on this device for now.'
  }
  return 'Connecting to your ATproto repository…'
})

const canRemoveDeviceData = computed(
  () => (target.value === 'vault' || target.value === 'public') && status.value === 'idle',
)

const statusDescription = computed(() => {
  if (status.value === 'syncing') return 'Saving to your repository…'
  if (status.value === 'offline')
    return 'You are offline. Your changes are saved on this device and sent once you are back online.'
  if (status.value === 'failed') return 'Saving your latest changes failed. We retry automatically.'
  return null
})

async function signIn() {
  const identifier = handle.value.trim()
  if (!identifier) return

  signingIn.value = true
  signInError.value = null
  try {
    await signInWithAtproto(identifier)
  } catch (error) {
    console.error('[time-tracker] The ATproto sign-in failed.', error)
    signInError.value = 'We could not start the sign-in. Please check your handle and try again.'
    signingIn.value = false
  }
}

async function storePublicly() {
  if (!authUser.value) return
  switchingStorage.value = true
  try {
    await enablePublicStorage(authUser.value.did)
  } finally {
    switchingStorage.value = false
  }
}

async function stopStoringPublicly() {
  if (!authUser.value) return
  switchingStorage.value = true
  try {
    await disablePublicStorage(authUser.value.did)
    toast('Your public records were deleted. Your data stays on this device now.')
  } catch {
    toast('Your public records could not be deleted. Please try again.')
  } finally {
    switchingStorage.value = false
  }
}
</script>

<template>
  <Card v-if="authUser">
    <CardHeader>
      <CardTitle as="h2">ATproto Account</CardTitle>
      <CardDescription>You are signed in as @{{ authUser.handle ?? authUser.did }}.</CardDescription>
    </CardHeader>
    <CardContent class="space-y-2 text-sm">
      <p>{{ storageDescription }}</p>
      <p v-if="statusDescription" role="status" :class="status === 'failed' && 'text-destructive-text font-medium'">
        {{ statusDescription }}
      </p>
      <p v-if="status === 'failed' && lastError" class="text-muted-foreground font-mono text-xs break-words">
        {{ lastError }}
      </p>
      <p v-if="target === 'device'" class="text-muted-foreground">
        You can store your data as public records instead. Anyone can read public records, including your projects,
        tasks and sessions.
      </p>
    </CardContent>
    <CardFooter class="flex flex-wrap gap-4 border-t px-6 py-4">
      <ConfirmPopover
        v-if="target === 'device'"
        title="Store your data publicly?"
        confirm-label="Store publicly"
        variant="destructive"
        @confirm="storePublicly"
      >
        <template #trigger>
          <Button variant="outline" :disabled="switchingStorage || !online">Store publicly</Button>
        </template>
        <p>
          Your projects, tasks, sessions and settings are written as public records to your ATproto repository, and
          anyone can read them.
        </p>
        <p>
          Consider them public forever: other services copy public records as soon as they are written, so deleting them
          later does not remove every copy.
        </p>
      </ConfirmPopover>
      <ConfirmPopover
        v-if="target === 'public'"
        title="Stop storing your data publicly?"
        confirm-label="Delete public records"
        variant="destructive"
        @confirm="stopStoringPublicly"
      >
        <template #trigger>
          <Button variant="outline" :disabled="switchingStorage || !online">Stop storing publicly</Button>
        </template>
        <p>
          All Time Tracker records are deleted from your ATproto repository, and your data stays on this device only.
          Copies that other services already made cannot be removed.
        </p>
      </ConfirmPopover>
      <Button variant="outline" @click="signOut()">Sign out</Button>
      <ConfirmPopover
        v-if="canRemoveDeviceData"
        title="Sign out and remove your data from this device?"
        confirm-label="Sign out"
        @confirm="signOut({ removeDeviceData: true })"
      >
        <template #trigger>
          <Button variant="outline">Sign out and remove from this device</Button>
        </template>
        <p>Your data stays in your ATproto repository. This device forgets it, which is useful on shared computers.</p>
      </ConfirmPopover>
    </CardFooter>
  </Card>
  <form v-else @submit.prevent="signIn">
    <Card>
      <CardHeader>
        <CardTitle as="h2">ATproto Account</CardTitle>
        <CardDescription>
          Sign in with your Bluesky or other ATproto account to store your data in your own repository. Your data on
          this device is copied to your account if it is still empty.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-2">
          <Label for="settings-handle">Handle</Label>
          <div class="relative">
            <AtSign
              class="text-muted-foreground pointer-events-none absolute top-3 left-3 h-4 w-4"
              aria-hidden="true"
            />
            <Input
              id="settings-handle"
              v-model="handle"
              class="pl-9"
              placeholder="alice.bsky.social"
              autocomplete="username"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              :disabled="signingIn"
              :aria-invalid="Boolean(signInError)"
              :aria-describedby="signInError ? 'settings-handle-message' : undefined"
            />
          </div>
          <p
            v-if="signInError"
            id="settings-handle-message"
            class="text-destructive-text text-sm font-medium"
            role="alert"
          >
            {{ signInError }}
          </p>
        </div>
      </CardContent>
      <CardFooter class="border-t px-6 py-4">
        <Button type="submit" :disabled="!handle.trim() || signingIn || !online">
          {{ signingIn ? 'Redirecting…' : 'Sign in' }}
        </Button>
      </CardFooter>
    </Card>
  </form>
</template>
