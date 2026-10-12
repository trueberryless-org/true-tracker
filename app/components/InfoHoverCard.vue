<script setup lang="ts">
import { BadgeInfo } from '@lucide/vue'

const { label } = defineProps<{ label: string }>()
const open = ref(false)
</script>

<template>
  <HoverCard v-model:open="open">
    <HoverCardTrigger as-child>
      <button
        type="button"
        class="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-hidden"
        :aria-label="label"
        :aria-expanded="open"
        @click="open = !open"
      >
        <BadgeInfo class="text-primary-text h-5 w-5" aria-hidden="true" />
      </button>
    </HoverCardTrigger>
    <HoverCardContent class="w-80" align="end">
      <div class="flex justify-between space-x-4">
        <Avatar>
          <AvatarImage src="https://github.com/trueberryless.png" />
          <AvatarFallback>T</AvatarFallback>
        </Avatar>
        <div class="space-y-1">
          <h4 class="text-sm font-semibold">@trueberryless</h4>
          <p class="text-sm">
            <slot />
          </p>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
</template>
