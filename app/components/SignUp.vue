<script setup lang="ts">
import { AtSign } from '@lucide/vue'

const username = ref('')
const usernameError = ref<string | null>(null)
const file = ref<File | null>(null)
const handle = ref('')
const signingIn = ref(false)
const signInError = ref<string | null>(null)
const online = useOnline()

function createAccount() {
  usernameError.value = validateUsername(username.value)
  if (usernameError.value) return
  signUpLocally(username.value)
}

function selectFile(event: Event) {
  file.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

async function importSelectedFile() {
  if (file.value) await importUserFile(file.value)
}

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
</script>

<template>
  <div class="bg-muted/40 flex min-h-screen w-full flex-col justify-center p-4">
    <main id="main-content" tabindex="-1" class="mx-auto grid gap-4 focus:outline-hidden lg:grid-cols-9">
      <h1 class="sr-only">Welcome to Time Tracker</h1>
      <div class="col-span-4 flex items-center justify-center">
        <div class="w-full">
          <form novalidate @submit.prevent="createAccount">
            <Card class="mx-auto w-full">
              <CardHeader>
                <CardTitle as="h2" class="text-xl">Sign Up</CardTitle>
                <CardDescription>Enter your information to create an account.</CardDescription>
              </CardHeader>
              <CardContent>
                <div class="grid gap-4">
                  <div class="grid gap-2">
                    <div class="space-y-2">
                      <Label for="signup-username" :class="usernameError && 'text-destructive'">Username</Label>
                      <Input
                        id="signup-username"
                        v-model="username"
                        placeholder="imcool"
                        autocomplete="username"
                        :aria-invalid="Boolean(usernameError)"
                        :aria-describedby="usernameError ? 'signup-username-message' : undefined"
                        @input="usernameError = null"
                      />
                      <p v-if="usernameError" id="signup-username-message" class="text-destructive text-sm font-medium">
                        {{ usernameError }}
                      </p>
                    </div>
                  </div>
                  <Button type="submit" class="w-full">Create an account</Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
      <div class="hidden auto-cols-min items-center justify-center lg:flex" aria-hidden="true">
        <div class="bg-primary h-40 w-1 rounded-lg" />
      </div>
      <div class="col-span-4 flex items-center justify-center">
        <Card class="mx-auto w-full">
          <CardHeader>
            <CardTitle as="h2" class="text-xl">Log In</CardTitle>
            <CardDescription>You can log in by uploading previously exported user data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="signup-import">User data (JSON)</Label>
                <input
                  id="signup-import"
                  type="file"
                  accept="application/json"
                  class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
                  @change="selectFile"
                />
              </div>
              <div class="grid grid-cols-3 gap-2">
                <Button class="col-span-2 w-full" :disabled="!file" @click="importSelectedFile"
                  >Import user data</Button
                >
                <Button class="w-full" variant="outline" @click="startTestMode">Try test data</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div class="lg:col-span-9">
        <form @submit.prevent="signIn">
          <Card class="mx-auto w-full">
            <CardHeader>
              <CardTitle as="h2" class="text-xl">Sign in with ATproto</CardTitle>
              <CardDescription>
                Use your Bluesky or other ATproto account to keep your data in your own repository and use it on every
                device.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div class="grid gap-2">
                  <Label for="signup-handle">Handle</Label>
                  <div class="relative">
                    <AtSign
                      class="text-muted-foreground pointer-events-none absolute top-3 left-3 h-4 w-4"
                      aria-hidden="true"
                    />
                    <Input
                      id="signup-handle"
                      v-model="handle"
                      class="pl-9"
                      placeholder="alice.bsky.social"
                      autocomplete="username"
                      autocapitalize="none"
                      autocorrect="off"
                      spellcheck="false"
                      :disabled="signingIn"
                      :aria-invalid="Boolean(signInError)"
                      :aria-describedby="signInError ? 'signup-handle-message' : undefined"
                    />
                  </div>
                </div>
                <Button type="submit" :disabled="!handle.trim() || signingIn || !online">
                  {{ signingIn ? 'Redirecting…' : 'Continue' }}
                </Button>
              </div>
              <p v-if="!online" class="text-muted-foreground mt-2 text-sm" role="status">
                You are offline. Connect to the internet to sign in.
              </p>
              <p
                v-if="signInError"
                id="signup-handle-message"
                class="text-destructive mt-2 text-sm font-medium"
                role="alert"
              >
                {{ signInError }}
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  </div>
</template>
