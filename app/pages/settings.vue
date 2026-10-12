<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { toast } from 'vue-sonner'

import { EXPORT_REMINDERS } from '~~/shared/atproto/lexicons'

const ACTIVE_TAB_KEY = 'activeTab'
const TABS = ['General', 'Themes', 'Automation', 'Export / Import', 'Danger Zone'] as const

useHead({ title: 'Settings · Time Tracker' })

const { isAccount, user } = useTracker()
const colorMode = useColorMode()
const activeTab = ref<string>('General')
const username = ref('')
const usernameError = ref<string | null>(null)
const pictureData = ref<string | null>(null)
const importFile = ref<File | null>(null)
const exportedNow = ref(false)
const exportReminder = ref<ExportReminder>('weekly')

const automationGroups = Object.entries(
  Object.groupBy(automationSettings, (setting) => setting.group) as Record<string, AutomationSetting[]>,
)
const exportReminderLabels: Record<ExportReminder, string> = { daily: 'Daily', monthly: 'Monthly', weekly: 'Weekly' }
const colorModes = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
]

const lastExportedText = computed(() => {
  if (!user.value) return ''
  if (exportedNow.value) return 'now'
  const lastExported = user.value.settings.lastExported
  return `${isToday(lastExported) ? 'at' : 'on'} ${formatDateTime(lastExported)}`
})

const colorTheme = computed({
  get: () => user.value?.settings.theme ?? 'default',
  set: (theme: Theme) => setColorTheme(theme),
})

onMounted(() => {
  const stored = readSessionValue(ACTIVE_TAB_KEY)
  const tab = stored?.replaceAll('"', '')
  if (tab && (TABS as readonly string[]).includes(tab)) activeTab.value = tab
})

watch(
  user,
  (value) => {
    if (!value) return
    if (!username.value) username.value = value.username
    exportReminder.value = value.settings.exportReminder
  },
  { immediate: true },
)

watch(activeTab, (tab) => writeSessionValue(ACTIVE_TAB_KEY, tab))

function saveUsername() {
  usernameError.value = validateUsername(username.value)
  if (!usernameError.value) setUsername(username.value)
}

async function selectPicture(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    pictureData.value = await resizeImageToDataUrl(file)
  } catch (error) {
    console.error('[time-tracker] Failed to read the selected picture.', error)
    toast('The selected file could not be read as an image.')
  }
}

async function savePicture() {
  if (!pictureData.value) {
    toast('No picture selected. Please choose a picture.')
    return
  }
  await setProfilePicture(pictureData.value)
}

function selectImportFile(event: Event) {
  importFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

async function importSelectedFile() {
  if (importFile.value) await importUserFile(importFile.value)
}

function exportData() {
  exportNow()
  exportedNow.value = true
}

function isToday(date: Date) {
  return date.toDateString() === new Date().toDateString()
}

const tabTriggerClass =
  'data-[state=active]:text-primary-text focus-visible:ring-ring rounded-sm text-left outline-hidden focus-visible:ring-2 data-[state=active]:font-semibold'
const fileInputClass =
  'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden'
</script>

<template>
  <LoadingAlert v-if="!user" />
  <PageContainer v-else>
    <div class="mx-auto grid w-full max-w-6xl gap-2">
      <h1 class="text-3xl font-semibold">Settings</h1>
    </div>
    <TabsRoot
      v-model="activeTab"
      orientation="vertical"
      class="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)]"
    >
      <TabsList aria-label="Settings sections" class="text-muted-foreground grid gap-4 text-sm">
        <TabsTrigger v-for="tab in TABS" :key="tab" :value="tab" :class="tabTriggerClass">{{ tab }}</TabsTrigger>
      </TabsList>

      <TabsContent value="General" class="grid gap-6 outline-hidden">
        <SettingsAccountCard />
        <form novalidate class="space-y-6" @submit.prevent="saveUsername">
          <Card>
            <CardHeader>
              <CardTitle as="h2">Username</CardTitle>
              <CardDescription id="settings-username-description">This is your display name.</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-2">
                <Label for="settings-username" class="sr-only">Username</Label>
                <Input
                  id="settings-username"
                  v-model="username"
                  :placeholder="user.username"
                  autocomplete="username"
                  :aria-invalid="Boolean(usernameError)"
                  :aria-describedby="
                    usernameError
                      ? 'settings-username-description settings-username-message'
                      : 'settings-username-description'
                  "
                  @input="usernameError = null"
                />
                <p
                  v-if="usernameError"
                  id="settings-username-message"
                  class="text-destructive-text text-sm font-medium"
                >
                  {{ usernameError }}
                </p>
              </div>
            </CardContent>
            <CardFooter class="border-t px-6 py-4">
              <Button type="submit">Save</Button>
            </CardFooter>
          </Card>
        </form>
        <Card>
          <CardHeader>
            <CardTitle as="h2">Profile Picture</CardTitle>
            <CardDescription>Upload, update or remove your profile picture here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label for="settings-picture" class="sr-only">Profile picture</Label>
            <input id="settings-picture" type="file" accept="image/*" :class="fileInputClass" @change="selectPicture" />
          </CardContent>
          <CardFooter class="flex flex-wrap gap-4 border-t px-6 py-4">
            <Button @click="savePicture">Set Profile Picture</Button>
            <Button variant="destructive" @click="removeProfilePicture">Remove Profile Picture</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="Themes" class="grid gap-6 outline-hidden">
        <Card>
          <CardHeader>
            <CardTitle as="h2">Light / Dark Mode</CardTitle>
            <CardDescription id="settings-mode-description">
              Choose the lightness / darkness of your interface here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup v-model="colorMode.preference" aria-describedby="settings-mode-description">
              <div v-for="mode in colorModes" :key="mode.value" class="flex items-center space-x-2">
                <RadioGroupItem :id="`settings-mode-${mode.value}`" :value="mode.value" />
                <Label :for="`settings-mode-${mode.value}`">{{ mode.label }}</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle as="h2">Color Modes</CardTitle>
            <CardDescription id="settings-theme-description"
              >Choose the color theme which you like most.</CardDescription
            >
          </CardHeader>
          <CardContent>
            <RadioGroup v-model="colorTheme" aria-describedby="settings-theme-description">
              <div v-for="theme in themes" :key="theme.value" class="flex items-center space-x-2">
                <RadioGroupItem :id="`settings-theme-${theme.value}`" :value="theme.value" />
                <Label :for="`settings-theme-${theme.value}`">{{ theme.label }}</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="Automation" class="grid gap-6 outline-hidden">
        <Card v-for="[group, settings] in automationGroups" :key="group">
          <CardHeader>
            <CardTitle as="h2">{{ group }}</CardTitle>
            <CardDescription>Here you can see options for automating your workflow within the app.</CardDescription>
          </CardHeader>
          <CardFooter class="flex-col border-t p-0">
            <Table>
              <TableBody>
                <TableRow v-for="setting in settings" :key="setting.key">
                  <TableCell class="px-6 font-medium">
                    <Label :for="`automation-${setting.key}`" class="space-y-0">
                      <div class="text-base">{{ setting.label }}</div>
                      <div class="text-muted-foreground">{{ setting.description }}</div>
                    </Label>
                  </TableCell>
                  <TableCell class="px-6 text-right">
                    <Switch
                      :id="`automation-${setting.key}`"
                      :model-value="user.settings.automation[setting.key]"
                      @update:model-value="(checked) => setAutomation(setting.key, checked)"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="Export / Import" class="grid gap-6 outline-hidden">
        <Card>
          <CardHeader>
            <CardTitle as="h2">Export Data</CardTitle>
            <CardDescription>
              This will generate a JSON with your data, so you can import it again later.
              <br />
              <span class="block">The last time you exported your data was {{ lastExportedText }}.</span>
            </CardDescription>
          </CardHeader>
          <CardFooter class="border-t px-6 py-4">
            <Button @click="exportData">Export</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle as="h2">Import Data</CardTitle>
            <CardDescription>Import you recently exported data here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label for="settings-import" class="sr-only">Exported data (JSON)</Label>
            <input
              id="settings-import"
              type="file"
              accept="application/json"
              :class="fileInputClass"
              @change="selectImportFile"
            />
          </CardContent>
          <CardFooter class="border-t px-6 py-4">
            <Button :disabled="!importFile" @click="importSelectedFile">Import</Button>
          </CardFooter>
        </Card>
        <form class="space-y-6" @submit.prevent="setExportReminder(exportReminder)">
          <Card>
            <CardHeader>
              <CardTitle as="h2">Export Notification Frequency</CardTitle>
              <CardDescription>How often do you want to be reminded to export data?</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <Label id="settings-reminder-label">Notify me...</Label>
                <RadioGroup
                  v-model="exportReminder"
                  class="flex flex-col space-y-1"
                  aria-labelledby="settings-reminder-label"
                >
                  <div
                    v-for="reminder in EXPORT_REMINDERS"
                    :key="reminder"
                    class="flex items-center space-y-0 space-x-3"
                  >
                    <RadioGroupItem :id="`settings-reminder-${reminder}`" :value="reminder" />
                    <Label :for="`settings-reminder-${reminder}`" class="font-normal">
                      {{ exportReminderLabels[reminder] }}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter class="border-t px-6 py-4">
              <Button type="submit">Save</Button>
            </CardFooter>
          </Card>
        </form>
      </TabsContent>

      <TabsContent value="Danger Zone" class="grid gap-6 outline-hidden">
        <Card>
          <CardHeader>
            <CardTitle as="h2">Delete All Projects</CardTitle>
            <CardDescription>
              This will delete all projects with their time entries.
              <br />
              Please consider exporting before proceeding.
            </CardDescription>
          </CardHeader>
          <CardFooter class="border-t px-6 py-4">
            <ConfirmDialog :show-cancel="false" confirm-label="Confirm" @confirm="deleteAllProjects">
              <template #trigger>
                <DialogTrigger as-child>
                  <Button variant="destructive">Delete</Button>
                </DialogTrigger>
              </template>
              This action cannot be undone. This will permanently delete all your projects and remove this data from
              your {{ isAccount ? 'account' : 'local storage' }}.
            </ConfirmDialog>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle as="h2">Delete All Data</CardTitle>
            <CardDescription>
              All your projects, time entries and everything else will be completely erased from existence.
              <br />
              Please consider exporting before proceeding.
            </CardDescription>
          </CardHeader>
          <CardFooter class="border-t px-6 py-4">
            <ConfirmDialog
              :show-cancel="false"
              confirm-label="Confirm"
              @confirm="clearAllData('All data cleared successfully.')"
            >
              <template #trigger>
                <DialogTrigger as-child>
                  <Button variant="destructive">Delete</Button>
                </DialogTrigger>
              </template>
              This action cannot be undone. This will permanently delete your account and remove your data from your
              {{ isAccount ? 'ATproto repository and this device' : 'local storage' }}.
            </ConfirmDialog>
          </CardFooter>
        </Card>
      </TabsContent>
    </TabsRoot>
  </PageContainer>
</template>
