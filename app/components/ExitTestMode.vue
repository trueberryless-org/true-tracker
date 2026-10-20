<script setup lang="ts">
import { ShieldAlert } from '@lucide/vue'

const data = ref(createRandomBars())

function createRandomBars(): BarDatum[] {
  return Array.from({ length: 13 }, (_, index) => ({
    label: `Bar ${index + 1}`,
    value: Math.floor(Math.random() * 400) + 100,
  }))
}

function exitTestMode() {
  void clearAllData('Successfully exited test mode.')
}
</script>

<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button variant="destructive" class="fixed bottom-4 left-4" size="icon">
        <ShieldAlert class="h-4 w-4" aria-hidden="true" />
        <span class="sr-only">Exit test mode</span>
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle>Exit Test Mode</DrawerTitle>
          <DrawerDescription>
            You&apos;re in currently experienting the entire application with a test user. We recommend exiting this
            test user and creating a new user or import existing data from a previous user in the Sign Up menu.
          </DrawerDescription>
        </DrawerHeader>
        <div class="p-4 pb-0">
          <div class="mt-3 h-[120px]">
            <ChartBar
              :data="data"
              color="hsl(var(--foreground) / 0.9)"
              series-label="Value"
              title="Decorative random chart"
              :fixed-height="120"
              :radius="4"
              :show-axis="false"
              :show-grid="false"
              :show-tooltip="false"
              :show-value-labels="false"
            />
          </div>
        </div>
        <DrawerFooter>
          <Button @click="exitTestMode">Go back to Sign Up</Button>
          <DrawerClose as-child>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
