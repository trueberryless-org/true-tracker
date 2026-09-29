<script setup lang="ts">
import { CircleUser, Menu, Timer } from '@lucide/vue'
import { DialogDescription, DialogTitle } from 'reka-ui'

const route = useRoute()
const { isAccount, user } = useTracker()
const authUser = useAuthUser()
const { status, target } = useSyncState()
const isSheetOpen = ref(false)

const links = [
  { label: 'Dashboard', to: '/', matches: (path: string) => path === '/' },
  { label: 'Projects', to: '/projects', matches: (path: string) => path.startsWith('/projects') },
  { label: 'Tasks', to: '/tasks', matches: (path: string) => path.startsWith('/tasks') },
  { label: 'Sessions', to: '/sessions', matches: (path: string) => path === '/sessions' },
  { label: 'Settings', to: '/settings', matches: (path: string) => path.startsWith('/settings') },
]

const syncLabel = computed(() => {
  if (target.value === 'device') return 'Stored on this device only'
  if (status.value === 'syncing') return 'Saving to your repository…'
  if (status.value === 'failed') return 'Saving failed, retrying…'
  if (status.value === 'offline') return 'Offline, saved on this device'
  return target.value === 'public' ? 'Saved to your public repository' : 'Saved to your private space'
})

watch(
  () => route.fullPath,
  () => {
    isSheetOpen.value = false
  },
)

function linkClass(isActive: boolean) {
  return cn(isActive ? 'text-foreground' : 'text-muted-foreground', 'hover:text-foreground transition-colors')
}
</script>

<template>
  <header class="bg-background sticky top-0 z-50 flex h-16 items-center gap-4 border-b px-4 md:px-10">
    <nav
      aria-label="Main"
      class="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6"
    >
      <NuxtLink to="/" class="flex items-center gap-2 text-lg font-semibold md:text-base">
        <Timer class="h-6 w-6" aria-hidden="true" />
        <span class="sr-only">Time Tracker</span>
      </NuxtLink>
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :class="linkClass(link.matches(route.path))"
        :aria-current="link.matches(route.path) ? 'page' : undefined"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
    <Dialog v-model:open="isSheetOpen">
      <DialogTrigger as-child>
        <Button variant="outline" size="icon" class="shrink-0 md:hidden">
          <Menu class="h-5 w-5" aria-hidden="true" />
          <span class="sr-only">Toggle navigation menu</span>
        </Button>
      </DialogTrigger>
      <SheetContent side="left">
        <DialogTitle class="sr-only">Navigation</DialogTitle>
        <DialogDescription class="sr-only">Go to another page of Time Tracker.</DialogDescription>
        <nav aria-label="Main" class="grid gap-6 text-lg font-medium">
          <NuxtLink to="/" class="flex items-center gap-2 text-lg font-semibold md:text-base">
            <Timer class="h-6 w-6" aria-hidden="true" />
            <span class="sr-only">Time Tracker</span>
          </NuxtLink>
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            :class="linkClass(route.path === link.to)"
            :aria-current="route.path === link.to ? 'page' : undefined"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </SheetContent>
    </Dialog>
    <div class="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
      <div class="ml-auto flex flex-1 items-center gap-4 sm:flex-initial">
        <ModeToggle />
        <ThemeSwitcher />
      </div>
      <DropdownMenu v-if="user">
        <DropdownMenuTrigger
          class="bg-secondary focus-visible:ring-ring flex items-center gap-4 rounded-full ps-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
        >
          <span class="text-secondary-foreground max-w-32 truncate sm:max-w-96 md:max-w-56 lg:max-w-96">
            {{ user.username }}
          </span>
          <span :class="cn(buttonVariants({ size: 'icon' }), 'relative rounded-full')">
            <img
              v-if="user.profilePicture"
              :src="user.profilePicture"
              alt=""
              class="absolute inset-0 h-full w-full rounded-full object-cover"
            />
            <CircleUser v-else class="h-5 w-5" aria-hidden="true" />
            <span class="sr-only">Toggle user menu</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <template v-if="isAccount && authUser">
            <DropdownMenuLabel class="max-w-64">
              <span class="block truncate">@{{ authUser.handle ?? authUser.did }}</span>
              <span class="text-muted-foreground block text-xs font-normal" role="status">{{ syncLabel }}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </template>
          <DropdownMenuItem as-child>
            <NuxtLink to="/settings">Settings</NuxtLink>
          </DropdownMenuItem>
          <DropdownMenuItem @select="exportNow">Export data</DropdownMenuItem>
          <DropdownMenuItem v-if="isAccount" @select="signOut">Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>
